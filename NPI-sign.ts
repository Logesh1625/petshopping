import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicNetService } from '../../../../a_Public_net/Public_net.service';

interface ProposalDetail {
  formId: string;
  formCode: string;
  EmpNo: string;
  empName: string;
  site: string;
  salaryGrade: string;
  managementPosition: string;
  department: string;
  costCode: string;
  extNumber: string;
  email: string;
  proposalSite: string;
  area: string;
  building: string;
  floor: string;
  labName: string;
  DriEmp: string;
  hodEmployeeId: string;
  category: string;
  driEmployeeEmail: string;
  hodEmployeeEmail: string;
  totalPcQty: string;
  npsApprovedDate: string;
  REASON: string;
  CurApprovename: string;
}

type WorkStepStatusType = 'done' | 'pending' | 'delay' | 'rejected';

interface WorkStep {
  stepId: number;
  title: string;
  OPT_EMP_NAME: string;
  status: string;
  statusType: WorkStepStatusType;
  LAST_EDIT_DT: string;
  REASON: string;
}

@Component({
  selector: 'app-npi-proposal-view',
  templateUrl: './npi-proposal-view.component.html',
  styleUrls: ['./npi-proposal-view.component.less']
})
export class NpiProposalViewComponent implements OnInit {

  loading = true;
  error = false;
  formCode = '';
  detail: ProposalDetail | null = null;

  stepsLoading = true;
  stepsError = false;
  workSteps: WorkStep[] = [];

  constructor(
    private route: ActivatedRoute,
    private pns: PublicNetService
  ) { }

  ngOnInit(): void {
    this.formCode = this.route.snapshot.paramMap.get('formCode') || '';
    if (this.formCode) {
      this.fetchDetail(this.formCode);
    } else {
      this.loading = false;
      this.error = true;
      this.stepsLoading = false;
      this.stepsError = true;
    }
  }

  private getFirstValue(obj: any, keys: string[], fallback: any = ''): any {
    if (!obj) return fallback;
    for (const key of keys) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') return value;
    }
    return fallback;
  }

  private getFormCode(row: any): string {
    const value = this.getFirstValue(
      row,
      ['FORM_CODE', 'FormCode', 'FormNo', 'FORM_NO', 'ProposalNo', 'formCode'],
      ''
    );
    return String(value || '').trim();
  }

  private parseDotNetDate(value: any): number {
    if (!value) return 0;
    const str = String(value);
    const match = str.match(/\/Date\((\d+)\)\//);
    if (match) return parseInt(match[1], 10);
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  }

  private formatDisplayDate(value: any): string {
    const ts = this.parseDotNetDate(value);
    if (!ts) return '';
    const d = new Date(ts);
    const day = ('0' + d.getDate()).slice(-2);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private mapDetail(raw: any): ProposalDetail {
    const g = (keys: string[]) => this.getFirstValue(raw, keys, '');
    return {
      formId: g(['ID', 'Id', 'FORM_ID', 'FormId']),
      formCode: g(['FORM_CODE', 'FormCode', 'formCode']) || this.formCode,
      EmpNo: g(['EMP_ID', 'EmpId', 'EmpNo', 'EMP_NO']),
      empName: g(['EMP_NAME', 'EmpName', 'UserName', 'USER_NAME']),
      site: g(['SITE', 'Site', 'Factory', 'FACTORY']),
      salaryGrade: g(['SALARY_GRADE', 'SalaryGrade']),
      managementPosition: g(['MANAGEMENT_POSITION', 'ManagementPosition']) || 'NA',
      department: g(['UserDepartment', 'USER_DEPARTMENT', 'UserDept', 'USER_DEPT', 'DEPARTMENT', 'DEPT_NAME', 'Department', 'DeptName']),
      costCode: g(['COST_CODE', 'CostCode']),
      extNumber: g(['EXT_NUMBER', 'ExtNumber']),
      email: g(['EMAIL', 'Email']),
      proposalSite: g(['PROPOSAL_SITE', 'ProposalSite', 'SITE', 'Site', 'Factory', 'FACTORY']),
      area: g(['AREA', 'Area']),
      building: g(['BUILDING', 'Building']),
      floor: g(['FLOOR', 'Floor']),
      labName: g(['LabName', 'LAB_NAME', 'Lab_Name', 'Lab', 'LAB', 'Laboratory', 'LABORATORY']),
      DriEmp: g(['DriEmp', 'DriEmployeeId', 'DRI_EMP_NO', 'DriEmpNo']),
      hodEmployeeId: g(['HOD_EMPLOYEE_ID', 'HodEmployeeId', 'HOD_EMP_NO', 'HodEmpNo']),
      category: g(['Category1', 'Category', 'CATEGORY', 'FormCategory', 'FORM_CATEGORY', 'CATEGORY1']),
      driEmployeeEmail: g(['DriEmpEmail', 'DRI_EMPLOYEE_EMAIL_ID', 'DriEmployeeEmail', 'DRI_EMAIL', 'DriEmail']),
      hodEmployeeEmail: g(['HodEmpEmail', 'HOD_EMPLOYEE_EMAIL_ID', 'HodEmployeeEmail', 'HOD_EMAIL', 'HodEmail']),
      totalPcQty: g(['TOTAL_PC_QTY', 'TotalPcQty', 'PC_QTY', 'PcQty']),
      npsApprovedDate: this.formatDisplayDate(
        g(['NPS_APPROVED_DATE', 'NpsApprovedDate', 'CREATE_DT', 'CreateDt'])
      ),
      REASON: g(['REASON', 'Reason', 'APPLY_REASON', 'ApplyReason', 'DESCRIPTION', 'Description']),
      CurApprovename: g([
        'CurApprovename',
        'CUR_APPROVE_NAME',
        'CurApproveName',
        'CURRENT_APPROVER',
        'CurrentApprover',
        'ApproverName',
        'APPROVER_NAME',
        'CurApprover',
        'CUR_APPROVER',
        'signerName',
        'SignerName',
        'SIGNER_NAME',
        'SignEmpName',
        'SIGN_EMP_NAME',
        'AuditUser',
        'AUDIT_USER'
      ])
    };
  }

  // ⚠️ Applicant/Proposal info - reference pattern (getEmployeeStatusList) apdiye irukku
  fetchDetail(formCode: string): void {
    this.loading = true;
    this.error = false;

    this.pns.getEmployeeStatusList().subscribe({
      next: (list: any[]) => {
        list = list || [];
        const matches = list.filter((row: any) => this.getFormCode(row) === formCode);

        if (!matches.length) {
          this.error = true;
          this.loading = false;
          this.stepsLoading = false;
          this.stepsError = true;
          return;
        }

        this.detail = this.mapDetail(matches[0]);
        this.loading = false;
console.log('DEBUG: calling fetchWorkDetail with formId=', this.detail.formId, 'formCode=', formCode);

        // formId kedaichathum sign flow (Work Detail) API call pannunga
        this.fetchWorkDetail(this.detail.formId, formCode);
      },
      error: (err: any) => {
        console.error('NPI Proposal detail error:', err);
        this.error = true;
        this.loading = false;
        this.stepsLoading = false;
        this.stepsError = true;
      }
    });
  }

  /**
   * "Title(EmpId Name, EmpId2 Name2)" formatted ROUTE_DESC string-a parse pannudhu
   */
  private parseRouteDesc(desc: string): { title: string; empNames: string[] } {
    const match = String(desc || '').match(/^(.*?)\((.*)\)$/);
    if (!match) {
      return { title: desc, empNames: [] };
    }
    const title = match[1].trim();
    const empNames = match[2].split(',').map(part => {
      const p = part.trim();
      const m = p.match(/^(\S+)\s+(.*)$/);
      return m ? m[2].trim() : p;
    });
    return { title, empNames };
  }

  /**
   * ✅ Real GetFormSignFlowDetail_Oracle API rows-a WorkStep[]-a convert pannudhu
   * ROUTE_FLAG: '0' = Done, '1' = In Progress, '2' = Waiting
   */
  private mapGatewayRouteToWorkSteps(routes: any[]): WorkStep[] {
    return (routes || []).map((r: any, idx: number) => {
      const { title, empNames } = this.parseRouteDesc(r.ROUTE_DESC);
      const flag = String(r.ROUTE_FLAG);
      let statusType: WorkStepStatusType;
      let status: string;

      switch (flag) {
        case '0': statusType = 'done'; status = 'Approved'; break;
        case '1': statusType = 'pending'; status = 'In Progress'; break;
        case '2': statusType = 'pending'; status = 'Waiting'; break;
        case '3': statusType = 'rejected'; status = 'Rejected'; break;
        default: statusType = 'pending'; status = 'Pending';
      }

      return {
        stepId: idx,
        title,
        OPT_EMP_NAME: empNames.join(' / '),
        status,
        statusType,
        LAST_EDIT_DT: r.OPT_TIME ? this.formatDisplayDate(r.OPT_TIME) : '',
        REASON: (r.OPT_EXPLAIN && r.OPT_EXPLAIN !== 'null') ? String(r.OPT_EXPLAIN) : ''
      };
    });
  }

  // ✅ Sign-in Flow (Work Detail) - real API (GetFormSignFlowDetail_Oracle)
  fetchWorkDetail(formId: string, formCode: string): void {
    
    this.stepsLoading = true;
    this.stepsError = false;

    this.pns.getFormSignFlowDetail(formId,formCode, '').subscribe({
      next: (rows: any[]) => {
        rows = rows || [];
        console.log('Work detail raw rows for form:', formCode, rows);

        if (!rows.length) {
          this.stepsError = true;
          this.stepsLoading = false;
          return;
        }

        this.workSteps = this.mapGatewayRouteToWorkSteps(rows);
        this.stepsLoading = false;
      },
      error: (err: any) => {
        console.error('Work detail fetch error:', err);
        this.stepsError = true;
        this.stepsLoading = false;
      }
    });
  }
}
