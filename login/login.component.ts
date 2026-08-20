import { SettingsService, _HttpClient } from "@delon/theme";
import { Component, OnInit, OnDestroy, Inject, Optional, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import {
  ITokenService,
  DA_SERVICE_TOKEN
} from "@delon/auth";
import { ReuseTabService } from "@delon/abc";
import { StartupService } from "@core";
import { I18NService } from '@core';
import { CookieService } from 'ngx-cookie-service';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformLocation } from "@angular/common";

import { ScrollService, MenuService, MenuIcon } from '@delon/theme';
import { isArray } from 'util';
import {PublicNetService} from "../../a_Public_net/Public_net.service";
import {security} from '@shared';
import {serviceUrl,ouacServiceUrl} from "../../a_Public_net/Url";

@Component({
  selector: "passport-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.less"],
})
export class UserLoginComponent implements OnInit, OnDestroy {
  loading = false;
  iframeSrc: string = '';
  iframeSafeSrc: any;
  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    private settingService: SettingsService,
    private cookieService:CookieService,
    public http: _HttpClient,
    public msg: NzMessageService,
    public i18n: I18NService,
    public domSanitizer: DomSanitizer,
    public location: PlatformLocation,
    private menuService: MenuService,
    private publicSvr: PublicNetService,
  ) {
    // this.form = fb.group({
    //   userName: [null, [Validators.required, Validators.minLength(4)]],
    //   pwdInfo: [null, Validators.required],
    //   mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    //   captcha: [null, [Validators.required]],
    //   remember: [true]
    // });
    modalSrv.closeAll();
    // 获取当前语言对应的语句
    // this.msg.info(this.i18n.fanyi('menu.delon.table'))
  }
  
  // #region fields
  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.pwdInfo;
  }
  get remember() {
    return this.form.controls.remember;
  }
  form: FormGroup;
  error = "2";
  type = 0;

  // #region get captcha
  count = 0;
  interval$: any;
  // #endregion

  switch(ret: any) {
    this.type = ret.index;
  }

  
  // #endregion
  submit(userInfo?: string) {
    // console.log('hiii')
    // this.error = "";
    // if (this.type === 0) {
    //   this.userName.markAsDirty();
    //   this.userName.updateValueAndValidity();
    //   this.pwdInfo.markAsDirty();
    //   this.pwdInfo.updateValueAndValidity();
    //   if (this.userName.invalid || this.pwdInfo.invalid) {
    //     return;
    //   }
    // }
    // this.loading = true;
    // // 加密密碼
    // const _pwd = encrypt(this.pwdInfo.value);

// const str='F88743A28400788A7937B313BEB14497' --LMS_INDIA
//             const arr = str.split("").reverse();
//             let arr1=[],arr2=[];
//             arr.forEach((e,i)=>{
//              if(i%2==0){
//               arr1.push(e)
//              }else{
//               arr2.push(e)
//              }
//             })
//             arr2 = arr2.reverse();
//             let newArr = arr1.concat(arr2);
//             let newStr = newArr.join("");
//             const out = window.btoa(newStr)    // 返回newStr
// console.log(out)
      
    const data=JSON.parse(security.decrypt(userInfo, this.publicSvr.security.getDK('NzQxRTMzNzlBODA0MjM3OEY4NEE4MDc4NzNCMUJCNDk=')))//一賬通返回信息解密 //java加密：794fc586a5a5a589c4ac47402f7419c2

    // console.log("data",data)
    let userInfo2=security.encrypt(JSON.stringify(data),'6jxaHMIhvefCOokm5XbDdW4qzl30U7Kt')
  //  console.log(userInfo2)
    const param = {
      url: "/oneAccountLogin?_allow_anonymous=true",
      data: {
        userInfo: userInfo2,
        // username: this.userName.value,
        // password: _pwd,
        // rememberMe: this.remember.value ? "1" : "0"
      }
    };

    const body = security.encryptForWeb(JSON.stringify(param.data));
//  console.log(body)
    this.http.post(param.url, body, null, {headers:{"Content-Type": "application/json;charset=UTF-8"}}).subscribe(data => {
      const res = JSON.parse(security.decryptForWeb(data));
      // console.log(res)
      // console.log('登錄結果999',res.data.ClientIp)
      this.loading = false;
      if(res.status === 200){
        const user = {
          avatar: "./assets/tmp/img/avatar.jpg",
          eeid: res.data.eeid,
          name: res.data.empName,
          time: new Date().getTime()
        };
        this.loginSuccess(user, res.data.JsessionId,res.data.ClientIp)
      }else{
        this.msg.error(res.msg);

          // 根據地址判斷是否需要登錄信息
        let fromInfo=this.location.href.indexOf("?from=iportal");
        if(fromInfo>-1){
          this.router.navigateByUrl("/passport/login");
          localStorage.removeItem("fromInfo");
          localStorage.removeItem("toPageInfo");
        }
        const iframeSrc = `${ouacServiceUrl}&CallBack=/assets/login-callback.html?UserInfo&CssLink=/assets/sso-login.css&State=RxFdv2p7KsDq38CX&SSO=0`;
        document.querySelector('.login-iframe').setAttribute('src', iframeSrc) ;
      }
    });

  }
  // 监听iframe一账通登录回调页面传来的信息
  @HostListener('window:message', ['$event'])
  onMessage(e) {
    let info = e.data;
    if (info.msgType === 'login') {
      let str = info.UserInfo;
      this.submit(str);
    }
  }
  // #region social
async  loginSuccess(user, token,ClientIP) {
    // 用户信息：包括姓名、头像、邮箱地址
    this.settingService.setUser({userInfo:this.publicSvr.security.encryptForWeb(JSON.stringify(user))});
    // this.settingService.setUser(user);
    // 保存到cookie
    this.cookieService.set("USER_NO", this.publicSvr.security.encryptForWeb(user.eeid));
    this.cookieService.set("USER_NAME", this.publicSvr.security.encryptForWeb(user.name));
    // this.cookieService.set("USER_NO", user.eeid);
    // this.cookieService.set("USER_NAME", user.name);
    this.cookieService.set("IS_FOREIGN",'');
    this.cookieService.set("SESSION_ID",'');
    this.cookieService.set('FIH_TOKEN','');
    sessionStorage.setItem('ClientIp',ClientIP)
    

console.log("Login Details",user,token,ClientIP)
    // 解决冲突 
    // 清空路由复用信息
await this.publicSvr.insertLoginData(user.eeid, ClientIP);

    this.reuseTabService.clear();
    // 设置用户Token信息
    this.tokenService.set({token: token});
    // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
    this.startupSrv.load().then(() => {
      let url = this.tokenService.referrer!.url || "/";
      if (url.includes("/passport")) {
        url = "/";
      }
      if(this.toPage){
        // 獲取菜單信息
        this.getSystemMenu();
      }else if(this.menuId){
          // 獲取菜單信息
          this.getSystemMenu();
      }
      else{
        this.router.navigateByUrl(url);
      }
    });
  }

  isVisible:boolean=false;
  isForgetPassword:boolean=false;//是否顯示忘記密碼彈框
  toPage:any;
  menuId:any;
  ngOnInit() {
    let url = window.location.href;
    // 判斷是否是https網址，不是的話自動轉成https，測試網址和本地測試地址除外
    if (window.location.protocol !== 'https:' && url.indexOf('lms.idpbgtn.efoxconn.com') != -1 || url.indexOf('lms.idpbgind.efoxconn.com') != -1) {
      window.location.href = 'https://' + window.location.hostname + window.location.pathname + window.location.search + window.location.hash;
    }

   
    //   2024/6/12： 判斷當前登錄的url域名是否是fms.idpbgtn.efoxconn.com,是，則將當前url跳轉為fms.idpbgind.efoxconn.com
    if (window.location.hostname=="lms.idpbgtn.efoxconn.com") {
      window.location.href = url.replace("lms.idpbgtn.efoxconn.com","lms.idpbgind.efoxconn.com")
    }

         // 根據地址判斷是否需要登錄信息
         let fromInfo=this.location.href.indexOf("?from=iportal");
       
        //  從門戶網跳轉過來，免登陸
        if(fromInfo>-1){

           let origin = window.location.origin;
           if (!origin) {
             origin = `${window.location.protocol}//${window.location.host}`
            }

            const iframeSrc = `${ouacServiceUrl}&CallBack=/assets/login-callback.html?UserInfo&CssLink=/assets/sso-login.css&State=RxFdv2p7KsDq38CX&SSO=1`;
            this.iframeSafeSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSrc);


            // 是否有目標頁面
          let toPageIndex=this.location.href.indexOf("&toPage=");
           if(toPageIndex>-1){
          this.toPage=this.location.href.slice(toPageIndex + 8).replace(/%2F/g,'/');
           }

          //  是否存在menuId
          const menuIndex=this.location.href.indexOf("&menuId=");
           if(menuIndex>-1){
              this.menuId=this.location.href.slice(menuIndex + 8);
           }


      }else{
          // 2024/6/6： 顯示地址域名為fms.idpbgtn.efoxconn.com時，需要添加遮罩层，提示fms.idpbgind.efoxconn.com新網址(2024/6/13暫停使用*idpbgtn.efoxconn.com域名)
          // if (window.location.hostname == "fms.idpbgtn.efoxconn.com") {
          //   this.isVisible = true;
          // }

          let origin = window.location.origin;
          if (!origin) {
            origin = `${window.location.protocol}//${window.location.host}`
          }

          const iframeSrc = `${ouacServiceUrl}&CallBack=/assets/login-callback.html?UserInfo&CssLink=/assets/sso-login.css&State=RxFdv2p7KsDq38CX&SSO=0`;

          this.iframeSafeSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSrc);
      }
    
  }
  // #endregion
  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }





  // getSystemMenu() {
  //   const group = [
  //     {
  //       text: "主導航",
  //       group: true,
  //       children: []
  //     }
  //   ];
  //   this.http.post(serviceUrl+"/menuFms", {}).subscribe(res => {

  //     if(res && isArray(res)){
  //       group[0].children = this.arrayToTree(res);
  //       this.menuService.add(group);

  //       // 根據頁面路徑跳轉指定頁面
  //       if(this.toPage){
  //         let userMenu=[];
  //         if(res.length>0){
  //           res.forEach((item)=>{
  //             if(item.webUrl){
  //               userMenu.push(
  //                 {id:item.id,webUrl:item.webUrl}
  //               )
  //             }
  //           })
  //         } 
  //         this.goToPage(userMenu,this.toPage);
  //       }


  //       // 根據menuId跳轉到指定頁面
  //       if(this.menuId){
  //         const muneList=res.filter(item=>{
  //           return item.id == this.menuId;
  //         })

  //         if(muneList.length==0){
  //           console.log("找不到相關頁面",muneList)
  //           // 找不到相關頁面，返回登錄頁面
  //           this.publicSvr.logout();//
  //           // this.ngOnInit();
  //           window.location.href="https://lms.idpbgind.efoxconn.com/#/passport/login";
  //           const iframeSrc = `${ouacServiceUrl}&CallBack=/assets/login-callback.html?UserInfo&CssLink=/assets/sso-login.css&State=RxFdv2p7KsDq38CX&SSO=0`;
  //           this.iframeSafeSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSrc);
  //           this.msg.info("Cannot find the current click menu permissions, please contact the administrator to add menu permissions");//找不到當前點擊菜單權限，請聯繫管理員添加菜單權限
  //           this.menuId="";
  //         }else{
  //           const menuData=group[0].children;
  //           this.getToMenuData(menuData,this.menuId);
  //         }
  //       }
    

  //     }else{
  //       this.router.navigateByUrl("/dashboard");
  //       console.log("您暫無可查看的菜單，請聯繫管理員開通！")
  //     }
  //   });
  // }
 getSystemMenu() {
  const group = [
    {
      text: "主導航",
      group: true,
      children: [],
    },
  ];

  const params = {
    Func: "Permission management-GetUserPermitModuleBySystem",
    SystemId: 30373,
    EmpNo: this.publicSvr.getSettingUserINfo().eeid,
  };

  const param = true
    ? this.publicSvr.dealPostParamsEncrypt(params)
    : this.publicSvr.dealPostParams(params);

  new Promise((resolve, reject) => {
    this.http
      .post(
        'https://microservice.abgind.foxconn.com/india/gateway',
        param,
        null,
        {
          headers: {
            apiID: "ffff-1687574205823-1020819373-1797",
            userKey: this.publicSvr.USER_APPLIATION_WEB,
          },
        }
      )
      .subscribe(
        (data) => {
          let res = true
            ? JSON.parse(this.publicSvr.security.decrypt(data.r, this.publicSvr.iwxKInfo))
            : data;
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
  })
  .then((res: any) => {
    if (res.IsOK == "1") {
      group[0].children = this.arrayToTree(res.List);
      this.menuService.add(group);
    } else {
      this.msg.error("您暫無可查看的菜單，請聯繫管理員開通！", {
        nzDuration: 1000 * 3,
      });
    }
  });
}





  goToPage(userMenu, toPageInfo) {
    const toMenuData = userMenu.filter((item) => {
      return item.webUrl == toPageInfo;
    });

    // 找不到指定頁面或沒有權限
    if (toMenuData.length == 0) {
      // 找不到相關頁面，返回登錄頁面
      this.publicSvr.logout();
      this.ngOnInit(); //
    } else {
      this.router.navigateByUrl(toPageInfo);
    }
  }
    // // 跳轉目標頁面
    // goToPage(userMenu,toPageInfo){

    //   const toMenuData = userMenu.filter(item => {
    //     return item.webUrl == toPageInfo;
    //   });

    //   // 找不到指定頁面或沒有權限
    //   if(toMenuData.length==0){
    //      // 找不到相關頁面，返回登錄頁面
    //      this.publicSvr.logout();
    //     //  this.ngOnInit();//
    //     window.location.href="https://lms.idpbgind.efoxconn.com/#/passport/login";
    //     const iframeSrc = `${ouacServiceUrl}&CallBack=/assets/login-callback.html?UserInfo&CssLink=/assets/sso-login.css&State=RxFdv2p7KsDq38CX&SSO=0`;
    //     this.iframeSafeSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSrc);
    //     this.msg.info("Cannot find the current click menu permissions, please contact the administrator to add menu permissions");//找不到當前點擊菜單權限，請聯繫管理員添加菜單權限
    //     this.toPage="";
    //   }else{
    //     this.router.navigateByUrl(toPageInfo);
    //   }
  
    // }

  getToMenuData(data,menuId){
    const toMenuData = data.filter(item => {
        return item.id == menuId;
    });
    if(toMenuData.length==0){
      data.forEach((item)=>{
        if(item.children.length!=0){
          const list=item.children;
          this.getToMenuData(list,menuId)
        }
      })

    }else{
      const menuData=toMenuData[0];
      this.getPage(menuData)
    }
  }

  getPage(data){
    if(data.children.length>0){
      const list=data.children[0];
      this.getPage(list);
    }else{
      const toPage=data.link;
      this.router.navigateByUrl(toPage);
      localStorage.removeItem("fromInfo");
      localStorage.removeItem("toPageInfo");
      localStorage.removeItem("userMenu");
      localStorage.removeItem("userMenuId");

    }
  }


  arrayToTree(list, parentId = 0) {
    return list.filter(item => item.parentId === parentId).map(item => {
      let icon = item.icon ? {
        type: 'icon',
        value: item.icon.split('|')[0],
        theme: item.icon.split('|')[1] || 'outline'
      } as MenuIcon : null;
      return {
        text: item.name,
        icon: icon,
        link: item.menuType==='15'?item.webUrl+'/'+item.permissionId:item.webUrl,
        parentId: item.parentId,
        children: this.arrayToTree(list, item.id),
        menuType: item.menuType,
        id: item.id,
        permissionId: item.permissionId,
        show: true,
        urlKey: item.urlkey
      }
    });
  }

  resetInfo={
    account:"",
    code:"",
    newPassword:"",
    confirmPassword:"",
    email:"",
  }

  isCode:boolean=false;//判斷驗證碼是否一致
  // 顯示忘記密碼彈框
  openForgetPasswordModal(){
    this.isForgetPassword=true;
  }

  closeForgetPasswordModal(){
    this.isForgetPassword=false;
    this.isCode=false;
    this.resetInfo={
      account:"",
      code:"",
      newPassword:"",
      confirmPassword:"",
      email:""
    }
  }
  
  // 密碼校驗
  passwordChange(name){

    const newPassword=this.resetInfo.newPassword;
    const confirmPassword=this.resetInfo.confirmPassword;

    if (newPassword || confirmPassword) {
      // 密碼至少8位數，並且要包含字數字、字母、特殊符
      var reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~!@#$%^&*()_+<>?:"{},.\/\\;'[\]])[A-Za-z\d`~!@#$%^&*()_+<>?:"{},.\/\\;'[\]]{8,}$/;
      if (name == "newPassword") {
          const newPasswordResult = reg.test(newPassword);
          if (!newPasswordResult) {
            this.msg.error('The password must have at least 8 digits and must contain digits, letters, and special characters.', {
              nzDuration: 10000
            });
              this.resetInfo.newPassword = ""
              return false;
          }
      }



      if (name == "confirmPassword") {
          const confirmResult = reg.test(confirmPassword);
          if (!confirmResult) {
            this.msg.error('The password must have at least 8 digits and must contain digits, letters, and special characters.', {
              nzDuration: 10000
            });
              this.resetInfo.confirmPassword = ""
              return false;
          }
      }

      if (newPassword && confirmPassword) {
          if (newPassword != confirmPassword) {
            //輸入的密碼信息不一致
            this.msg.error('The entered password information is inconsistent.', {
              nzDuration: 10000
            });
            // this.resetInfo.confirmPassword = ""
          }
      }
  }
  }



  // 獲取驗證碼
  sendVerifivationCode(){
    if(!this.resetInfo.account){
      this.msg.error('Please enter your account');
      return false;
    }
    const params={
      EmpNo:this.resetInfo.account,
      CaptchaCode:"",
      Func:"H5-SendVerificationCode-IWX"
    }
    this.publicSvr.permitRequest(params,{
      headers:{
        apiID:"ffff-1655357911834-16925411121-0153",
        userKey:this.publicSvr.USER_GQ
      }
    },true).then((res:any)=>{
      if(res.IsOK=="1"){
        this.resetInfo.email=res.Msg;
      }else{
        this.msg.error(res.Msg);
      }
    })
  }  
  
  // 下一步--校验验证码
  nextOption(){
    if(!this.resetInfo.code){
      this.msg.error('Please enter verification code');
      return false;
    }

    const params={
      EmpNo:this.resetInfo.account,
      CaptchaCode:this.resetInfo.code,
      Func:"H5-CheckVerificationCode-IWX"
    }
    this.publicSvr.permitRequest(params,{
      headers:{
        apiID:"ffff-1655375927998-16925411121-0200",
        userKey:this.publicSvr.USER_GQ
      }
    },true).then((res:any)=>{
      if(res.IsOK=="1"){

        this.isCode=true;
      }else{
        this.msg.error(res.Msg);
      }
    })
  }

  // 重置密碼
  resetPassword(){
    // console.log("重置密碼")
    if (this.resetInfo.newPassword&&this.resetInfo.confirmPassword&&this.resetInfo.newPassword != this.resetInfo.confirmPassword) {
      //輸入的密碼信息不一致
      // this.msg.error('The entered password information is inconsistent.', {
      //   nzDuration: 10000
      // });
      // this.resetInfo.confirmPassword = ""
      return false;
    }
    if(!this.resetInfo.account||!this.resetInfo.code||!this.resetInfo.newPassword||!this.resetInfo.confirmPassword){
      this.msg.error("All information is required.");
      return false;
    }


    const params={
      EmpNo:this.resetInfo.account,
      Password:this.resetInfo.newPassword,
      CaptchaCode:this.resetInfo.code,
      Func:"H5-ChangeEmpPasswordV2-IWX"
    }
    // console.log('修改密码参数',params)
    this.publicSvr.permitRequest(params,{
      headers:{
        apiID:"ffff-1655376433685-16925411121-0217",
        userKey:this.publicSvr.USER_GQ
      }
    },true).then((res:any)=>{
      // console.log('修改密码res',res)
      if(res.IsOK=="1"){
        this.msg.success("Password changed successfully");
        // this.isForgetPassword=false;
        this.closeForgetPasswordModal()
      }else{
        this.msg.error(res.Msg);
      }
    })
  }

  // 關閉彈框
  handleCancel() {
    this.isVisible = false;
  }

}
