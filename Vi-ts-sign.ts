import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PublicNetService } from '../../../../a_Public_net/Public_net.service';

interface ProposalDetail {
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

  private readonly PROPOSALS_URL =
    'http://10.209.110.208:5665/api/proposals';

  private readonly STEP_TITLES: { [stepId: number]: string } = {
    0: 'Create Form',
    7: 'First Level',
    8: 'Second Level',
    182: 'ISM Engineer 1',
    183: 'ISM Engineer 1',
    201: 'ISM Head',
    202: 'OA Engineer',
    203: 'Net Engineer',
    204: 'SM Engineer',
    205: 'ISM Engineer 2'
  };

  private readonly ROUTE_NAMES = [
    'ISM Engineer 1',
    'ISM Head',
    'OA Engineer',
    'Net Engineer',
    'SM Engineer',
    'ISM Engineer 2'
  ];

  loading = true;
  error = false;
  formCode = '';
  detail: ProposalDetail | null = null;

  stepsLoading = true;
  stepsError = false;
  workSteps: WorkStep[] = [];

  constructor(
    private route: ActivatedRoute,
    private pns: PublicNetService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.formCode = this.route.snapshot.paramMap.get('formCode') || '';
    if (this.formCode) {
      this.fetchDetail(this.formCode);
      this.fetchWorkDetail(this.formCode);
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
          return;
        }

        this.detail = this.mapDetail(matches[0]);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('NPI Proposal detail error:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private stepTitle(stepId: number, routeOrder: number, isLast: boolean): string {
    if (this.STEP_TITLES[stepId]) return this.STEP_TITLES[stepId];
    if (isLast) return 'Closed';
    if (routeOrder >= 1 && routeOrder - 1 < this.ROUTE_NAMES.length) {
      return this.ROUTE_NAMES[routeOrder - 1];
    }
    return `Step ${stepId}`;
  }

  /**
   * ஒரே Step-ல் பல Users இருக்கும் rows-ஐ ஒன்றாக இணைக்கிறது (Merges multi-user rows for the same step)
   */
  private mapMergedWorkStep(rows: any[], isLast: boolean): WorkStep {
    const firstRow = rows[0];
    const stepId = Number(this.getFirstValue(firstRow, ['STEP_ID', 'StepId'], 0));
    const routeOrder = Number(this.getFirstValue(firstRow, ['ROUTE_ORDER', 'RouteOrder'], -1));
    const title = this.stepTitle(stepId, routeOrder, isLast);

    const isCreatorStep = stepId === 0 || routeOrder === 1 || title === 'Create Form';
    const isClosedStep = isLast || title === 'Closed';

    // Finished row உள்ளதா என்று பார்க்கவும்
    const finishedRow = rows.find(r => Number(this.getFirstValue(r, ['IS_FINISHED', 'IsFinished'], 0)) === 1);
    const rejectedRow = rows.find(r => Number(this.getFirstValue(r, ['IS_FINISHED', 'IsFinished'], 0)) === 2);
    const activeRow = finishedRow || rejectedRow || firstRow;

    const isFinished = Number(this.getFirstValue(activeRow, ['IS_FINISHED', 'IsFinished'], 0));

    // Status type கணக்கீடு
    let statusType: WorkStepStatusType;
    let status = String(
      this.getFirstValue(activeRow, ['STATUS', 'Status', 'ACTION', 'Action', 'DECISION', 'Decision', 'RESULT', 'Result'], '')
    ).trim();

    if (isFinished === 1) {
      statusType = 'done';
      if (!status) status = 'Approved';
    } else if (isFinished === 2) {
      statusType = 'rejected';
      if (!status) status = 'Rejected';
    } else {
      statusType = 'pending';
      if (!status) status = 'Pending';
    }

    //Step-ல் உள்ள அனைத்து User பெயர்களையும் சேர்க்கிறது (Duplicate இல்லாமல்)
    const empNames: string[] = [];
    if (statusType === 'done' || statusType === 'rejected') {
      // முடிவடைந்த Step என்றால் யார் கையொப்பமிட்டாரோ அவரது பெயர் மட்டும்
      const signedEmp = String(
        this.getFirstValue(activeRow, ['OPT_EMP_NAME', 'EmpName', 'UserName', 'USER_NAME', 'SignerName', 'SIGNER_NAME'], '')
      ).trim();
      if (signedEmp) empNames.push(signedEmp);
    } else {
      // Pending Step என்றால் அனைத்து பொறுப்பாளர்கள் பெயர்களும் (எ.கா: "Azhaguraj M / Sivakumar G")
      rows.forEach(r => {
        const name = String(
          this.getFirstValue(r, ['OPT_EMP_NAME', 'EmpName', 'UserName', 'USER_NAME', 'SignerName', 'SIGNER_NAME'], '')
        ).trim();
        if (name && !empNames.includes(name)) {
          empNames.push(name);
        }
      });
    }

    const OPT_EMP_NAME = empNames.join(' / ');

    // Remarks / Reason
    let REASON = '';
    if (!isCreatorStep && !isClosedStep) {
      for (const r of rows) {
        const res = String(
          this.getFirstValue(
            r,
            [
              'REASON', 'Reason',
              'REMARK', 'Remark',
              'OPT_CONTENT', 'OptContent', 'OPT_REMARK',
              'COMMENT', 'Comment',
              'COMMENTS', 'Comments',
              'AUDIT_REMARK', 'AuditRemark',
              'FLOW_REMARK', 'FlowRemark',
              'SIGN_REMARK', 'SignRemark',
              'CHECK_REMARK', 'CheckRemark',
              'NOTE', 'Note'
            ],
            ''
          )
        ).trim();
        if (res) {
          REASON = res;
          break;
        }
      }
    }

    // Date
    const rawLastEditDt = this.getFirstValue(
      activeRow,
      ['LAST_EDIT_DT', 'LastEditDt', 'LAST_EDIT_DATE', 'CREATE_DT', 'CreateDt'],
      ''
    );

    const formattedDate = (statusType === 'done' || statusType === 'rejected')
      ? this.formatDisplayDate(rawLastEditDt)
      : '';

    return {
      stepId,
      title,
      OPT_EMP_NAME,
      status,
      statusType,
      REASON,
      LAST_EDIT_DT: formattedDate
    };
  }

  fetchWorkDetail(formCode: string): void {
    this.stepsLoading = true;
    this.stepsError = false;

    this.http.get<any>(this.PROPOSALS_URL).subscribe({
      next: (res: any) => {
        const rows: any[] = (res && res.List) || (Array.isArray(res) ? res : []);
        const formRows = rows.filter((row: any) => this.getFormCode(row) === formCode);

        console.log('Work detail raw rows for form:', formCode, formRows);

        if (!formRows.length) {
          this.stepsError = true;
          this.stepsLoading = false;
          return;
        }

        formRows.sort((a: any, b: any) =>
          Number(this.getFirstValue(a, ['ROUTE_ORDER', 'RouteOrder'], 0)) -
          Number(this.getFirstValue(b, ['ROUTE_ORDER', 'RouteOrder'], 0))
        );

        // Group rows by ROUTE_ORDER and STEP_ID (Merge multiple candidate users into a single step)
        const stepGroups: { [key: string]: any[] } = {};
        const groupOrder: string[] = [];

        formRows.forEach((row: any) => {
          const routeOrder = this.getFirstValue(row, ['ROUTE_ORDER', 'RouteOrder'], '0');
          const stepId = this.getFirstValue(row, ['STEP_ID', 'StepId'], '0');
          const groupKey = `${routeOrder}_${stepId}`;

          if (!stepGroups[groupKey]) {
            stepGroups[groupKey] = [];
            groupOrder.push(groupKey);
          }
          stepGroups[groupKey].push(row);
        });

        this.workSteps = groupOrder.map((key, i) =>
          this.mapMergedWorkStep(stepGroups[key], i === groupOrder.length - 1)
        );

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


//////////////////////publuc ts //////////////////////

  getEmployeeStatusList(): Observable<any> {
    const _param = {
      Func: "NPIProposalForm-GetNPiProposalInfo",
      FormCode: "",
      EmpNo: "",
      Category1: "",
      EmpName: "",
      StartDate: "",
      EndDate: "",
      FormStatus: "",
      Factory: ""
    };

    const config = {
      headers: {
        apiID: "ffff-1783663681896-10208193125-1822",
        userKey: "E9785F13CCEAFB251A6AB147AFD24336",   // Test
      },
    };

    const param = this.dealPostParamsEncrypt(_param);
    return this.http
      .post('http://10.208.193.125:8086/gateway/manager', param, null, config)   // ← Test URL hardcode
      .pipe(
        map((resp: any) => {
          const res = JSON.parse(this.security.decrypt(resp.r, this.iwxKInfo));
          console.log('DEBUG - Employee Status API response:', res);
          if (res.IsOK === "1") {
            return res.List;
          }
          return [];
        })
      );
  }
/////////////////////////////////////////////////////////

  apiID: "ffff-1652929922559-17229253125-0664",
        userKey: "E9785F13CCEAFB251A6AB147AFD24336", 
