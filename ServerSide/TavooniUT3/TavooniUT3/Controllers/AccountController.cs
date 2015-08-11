using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using TavooniUT3.Models;
using System.IO;
using ExcelLibrary.SpreadSheet;
using OfficeOpenXml;
using System.Drawing;

namespace TavooniUT3.Controllers
{

    [HandleError]
    public class AccountController : Controller
    {

        public IFormsAuthenticationService FormsService { get; set; }
        public IMembershipService MembershipService { get; set; }

        public DatabaseDataContext m_model = new DatabaseDataContext();

        protected override void Initialize(RequestContext requestContext)
        {
            if (FormsService == null) { FormsService = new FormsAuthenticationService(); }
            if (MembershipService == null) { MembershipService = new AccountMembershipService(); }

            base.Initialize(requestContext);
        }

        // **************************************
        // URL: /Account/LogOff
        // **************************************

        public ActionResult LogOff()
        {
            FormsService.SignOut();

            return RedirectToAction("Index", "Home");
        }

        // **************************************
        // URL: /Account/ChangePassword
        // **************************************

        [Authorize]
        public ActionResult ChangePassword()
        {
            ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
            return View();
        }

        [Authorize]
        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordModel model)
        {
            if (ModelState.IsValid)
            {
                if (MembershipService.ChangePassword(User.Identity.Name, model.OldPassword, model.NewPassword))
                {
                    return RedirectToAction("ChangePasswordSuccess");
                }
                else
                {
                    ModelState.AddModelError("", "The current password is incorrect or the new password is invalid.");
                }
            }

            // If we got this far, something failed, redisplay form
            ViewData["PasswordLength"] = MembershipService.MinPasswordLength;
            return View(model);
        }

        // **************************************
        // URL: /Account/ChangePasswordSuccess
        // **************************************

        public ActionResult ChangePasswordSuccess()
        {
            return View();
        }


        //New Codes


        [Authorize(Roles = "Admin, ViewUsers")]
        public ActionResult GetListOfUsers()
        {
            try
            {
                var Result = Membership.GetAllUsers();
                return Json(new { Status = true, Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }


        [Authorize(Roles = "Admin, ViewRoles")]
        public ActionResult GetListOfRoles()
        {
            try
            {
                var Result = Roles.GetAllRoles();
                return Json(new { Status = true, Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin, ViewRoles, ViewUsers")]
        public ActionResult GetUserInRoles(String roleName)
        {
            try
            {
                if (Roles.RoleExists(roleName))
                {
                    var Result = Roles.GetUsersInRole(roleName);
                    return Json(new { Status = true, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(1);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult IsMember(String userName)
        {
            try
            {
                if (Membership.GetUser(userName) != null)
                {
                    var Result = Roles.GetRolesForUser(userName);
                    if (Roles.IsUserInRole("Member") == true)
                    {
                        return Json(new { Status = true }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { Status = false }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Error(1);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin,ViewRoles")]
        public ActionResult GetRolesForUser(String userName)
        {
            try
            {
                if (Membership.GetUser(userName) != null)
                {
                    var Result = Roles.GetRolesForUser(userName);
                    return Json(new { Status = true, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(1);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize]
        public ActionResult CreateUser(string userName, string email, string password, string[] roles)
        {
            try
            {
                MembershipCreateStatus createStatus = MembershipService.CreateUser(userName, password, email);
                if (createStatus == MembershipCreateStatus.Success)
                {
                    Roles.AddUserToRoles(userName, roles);
                    return Success(4);
                }
                else
                {
                    return Error(((int)createStatus) + 10);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize]
        public ActionResult CreateRole(string roleName)
        {
            try
            {
                if (Roles.RoleExists(roleName))
                    return Error(5);
                Roles.CreateRole(roleName);
                return Success(6);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize]
        public ActionResult LogOutOfServer()
        {
            try
            {
                FormsService.SignOut();
                return Success(9);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult LogOn(string username, string pass)
        {
            try
            {
                if (MembershipService.ValidateUser(username, pass))
                {
                    FormsService.SignIn(username, false);
                    if (Roles.IsUserInRole(username, "Member") == true)
                    {
                        return Json(new { Status = true, Message = "17", IsMember = true }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Json(new { Status = true, Message = "17", IsMember = false }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Error(8);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult GetUserBriefInfo()
        {
            try
            {
                if (Request.IsAuthenticated == false)
                {
                    return Error(30);
                }
                else
                {
                    String userName = User.Identity.Name;
                    var Result = Membership.GetUser(userName);
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName));
                    var UserPoint = CalculateUserPoint(user.UserId);
                    if (Roles.IsUserInRole("Member"))
                        return Json(new { Status = true, Result, Point = UserPoint, IsMember = true }, JsonRequestBehavior.AllowGet);
                    else
                        return Json(new { Status = true, Result, Point = UserPoint, IsMember = false }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult resetPassword(string username)
        {
            try
            {
                var user = Membership.GetUser(username);
                var result = user.ResetPassword();
                user.ChangePassword(result, username);
                return Json(new { Status = true, Result = username }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult unlockUser(string username)
        {
            try
            {
                var user = Membership.GetUser(username);
                var result = user.UnlockUser();
                return Json(new { Status = true, Result = username }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }



        [HttpGet]
        public ActionResult getTestCallBack()
        {
            try
            {
                string callBack = "Farzad added function that works";
                return Json(new { Status = true, mg = callBack }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }




        [HttpGet]
        public ActionResult IsLoggedIn()
        {
            try
            {
                if (Request.IsAuthenticated == false)
                {
                    return Error(30);
                }
                else
                {
                    String userName = User.Identity.Name;
                    var Result = Membership.GetUser(userName);
                    return Json(new { Status = true, Result }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        public ActionResult ChangePasswordBeta(string oldPassword, string newPassword)
        {
            try
            {
                String userName = User.Identity.Name;
                if (MembershipService.ChangePassword(userName, oldPassword, newPassword))
                {
                    return Success(31);
                }
                else
                {
                    return Error(32);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }


        public ActionResult Error(int ErrorCode)
        {
            try
            {
                return Json(new { Status = false, Message = ErrorCode }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Error(String Error)
        {
            try
            {
                return Json(new { Status = false, Message = Error }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Success(int errorCode)
        {
            try
            {
                return Json(new { Status = true, Message = errorCode }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        #region Active/Inactive Members
        [HttpGet]
        public ActionResult ActivateMember(string ProfileNationalityCode)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName));
                userId.aspnet_Membership.IsApproved = true;
                m_model.SubmitChanges();
                #endregion
                return Success(52);

            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult DeActivateMember(string ProfileNationalityCode)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName));
                userId.aspnet_Membership.IsApproved = false;
                m_model.SubmitChanges();
                #endregion
                return Success(53);

            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region AddMembeers

        [HttpPost]
        public ActionResult AddNewMember(string ProfileFirstName, string ProfileLastName, string ProfileGender,
            string ProfileDegree, string ProfileNationalityCode, string ProfileShenasnameCode, string ProfileShenasnamePlace,
            string ProfilePersonID, string ProfileBirthdateDay, string ProfileBirthdateMonth, string ProfileBirthdateYear,
            string ProfileMobile, string ProfileHomePhone, string ProfileWorkPhone, string ProfileEmail, string ProfileCity,
            string NewMemberEmployeeDateDay, string NewMemberEmployeeDateYear, string NewMemberEmployeeDateMonth,
            string NewMemberContractType, string NewMemberJobType, string NewMemberJobConcept, string NewMemberJobStatus,
            string NewMemberJob3University, string NewMemberIsargariType, string NewMemberEsratDuration,
            string NewMemberJanbaziPercent, string NewMemberJebheDuration, string NewMemberIsargariIsargarFamilyType,
            string NewMemberPictureName, string NewMemberjobName, string NewMemberJobPlace, bool NewMemberIsAzadeh, string NewMemberOthertype,
            bool NewMemberIsJanbaz, bool NewMemberIsRazmande, bool NewMemberIsIsargar, bool NewMemberIsFamilyOfShahid, bool NewMemberIsChildOfShahid)
        {
            try
            {
                #region Create User
                String userName = ProfileNationalityCode;
                String password = userName;
                String email = ProfileEmail;
                MembershipCreateStatus createStatus = MembershipService.CreateUser(userName, password, email);
                if (createStatus == MembershipCreateStatus.Success)
                {
                    Roles.AddUserToRole(userName, "Member");
                }
                else
                {
                    return Error(((int)createStatus) + 10);
                }

                var user = Membership.GetUser(userName);
                m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).aspnet_Membership.IsApproved = false;

                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion
                #region Add Profile
                MembersProfile profile = new MembersProfile();
                profile.MemberID = userId;
                profile.PersonalNumber = ProfilePersonID;
                profile.LastName = ProfileLastName;
                profile.FirstName = ProfileFirstName;
                profile.DegreeID = int.Parse(ProfileDegree);
                profile.CityID = int.Parse(ProfileCity);
                profile.BirthDate = ProfileBirthdateYear + ":" + ProfileBirthdateMonth + ":" + ProfileBirthdateDay;
                profile.Gender = int.Parse(ProfileGender) == 0 ? false : true;
                profile.IDCard = ProfileShenasnameCode;
                profile.IDCardPlace = ProfileShenasnamePlace;
                profile.InternationalCode = ProfileNationalityCode;
                profile.CreateDate = GetPersianDate(DateTime.Now);
                m_model.MembersProfiles.InsertOnSubmit(profile);
                #endregion
                #region Add Employee
                MembersEmployee employee = new MembersEmployee();
                employee.Contract = int.Parse(NewMemberContractType);
                employee.From = NewMemberEmployeeDateYear + ":" + NewMemberEmployeeDateMonth + ":" + NewMemberEmployeeDateDay;
                employee.Job = int.Parse(NewMemberJobType);
                employee.JobState = int.Parse(NewMemberJobStatus);
                employee.MemberID = userId;
                employee.Organization = int.Parse(NewMemberJobConcept);
                employee.University = int.Parse(NewMemberJob3University);
                employee.JobOtherType = int.Parse(NewMemberOthertype);
                employee.JobName = NewMemberjobName;
                employee.JobPlace = NewMemberJobPlace;

                m_model.MembersEmployees.InsertOnSubmit(employee);
                #endregion
                #region Isargari
                if (NewMemberIsAzadeh)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 1;
                    isargari.IsargariValue = NewMemberEsratDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsChildOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 6;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsFamilyOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 5;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsJanbaz)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 2;
                    isargari.IsargariValue = NewMemberJanbaziPercent;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsIsargar)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 4;
                    isargari.IsargarRelation = NewMemberIsargariIsargarFamilyType;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                else if (NewMemberIsRazmande)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 3;
                    isargari.IsargariValue = NewMemberJebheDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                #endregion
                #region Contacts
                MemberContact contacts = new MemberContact();
                contacts.Email = ProfileEmail;
                contacts.HomePhone = ProfileHomePhone;
                contacts.WorkPhone = ProfileWorkPhone;
                contacts.MobilePhone = ProfileMobile;
                contacts.MemberID = userId;
                m_model.MemberContacts.InsertOnSubmit(contacts);
                #endregion

                m_model.SubmitChanges();

                #region Apply Picture
                String lastName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), NewMemberPictureName);
                String newName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), userName + ".png");
                FileInfo f = new FileInfo(lastName);
                if (new FileInfo(newName).Exists)
                    System.IO.File.Delete(newName);
                if (f.Exists)
                {
                    System.IO.File.Copy(lastName, newName);
                    System.IO.File.Delete(lastName);
                }

                lastName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), NewMemberPictureName);
                newName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), userName + ".png");
                f = new FileInfo(lastName);
                if (new FileInfo(newName).Exists)
                    System.IO.File.Delete(newName);
                if (f.Exists)
                {
                    System.IO.File.Copy(lastName, newName);
                    System.IO.File.Delete(lastName);
                }
                #endregion
                return Success(33);
            }
            catch (Exception ex)
            {
                if (Membership.GetUser(ProfileNationalityCode) != null)
                    Membership.DeleteUser(ProfileNationalityCode);
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }
        #endregion
        #region EditMembers

        [HttpPost]
        public ActionResult EditMemebr(string ProfileFirstName, string ProfileLastName, string ProfileGender,
            string ProfileDegree, string ProfileNationalityCode, string ProfileShenasnameCode, string ProfileShenasnamePlace,
            string ProfilePersonID, string ProfileBirthdateDay, string ProfileBirthdateMonth, string ProfileBirthdateYear,
            string ProfileMobile, string ProfileHomePhone, string ProfileWorkPhone, string ProfileEmail, string ProfileCity,
            string NewMemberEmployeeDateDay, string NewMemberEmployeeDateYear, string NewMemberEmployeeDateMonth,
            string NewMemberContractType, string NewMemberJobType, string NewMemberJobConcept, string NewMemberJobStatus,
            string NewMemberJob3University, string NewMemberIsargariType, string NewMemberEsratDuration,
            string NewMemberJanbaziPercent, string NewMemberJebheDuration, string NewMemberIsargariIsargarFamilyType,
            string NewMemberPictureName, string NewMemberJobName, string NewMemberJobPlace, bool NewMemberIsAzadeh, string NewMemberOthertype,
            bool NewMemberIsJanbaz, bool NewMemberIsRazmande, bool NewMemberIsIsargar, bool NewMemberIsFamilyOfShahid, bool NewMemberIsChildOfShahid, string ProfileDocumentCode)
        {
            try
            {
                #region Create User
                String userName = ProfileNationalityCode;


                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }

                // m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).aspnet_Membership.IsApproved = false;

                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion
                #region Add Profile
                MembersProfile profile = m_model.MembersProfiles.Single(P => P.MemberID.Equals(userId));
                //profile.MemberID = userId;
                profile.PersonalNumber = ProfilePersonID;
                profile.LastName = ProfileLastName;
                profile.FirstName = ProfileFirstName;
                profile.DegreeID = int.Parse(ProfileDegree);
                profile.CityID = int.Parse(ProfileCity);
                profile.BirthDate = ProfileBirthdateYear + ":" + ProfileBirthdateMonth + ":" + ProfileBirthdateDay;
                profile.Gender = int.Parse(ProfileGender) == 0 ? false : true;
                profile.IDCard = ProfileShenasnameCode;
                profile.IDCardPlace = ProfileShenasnamePlace;
                profile.DocumentCode = ProfileDocumentCode;
                //profile.InternationalCode = ProfileNationalityCode;
                //profile.CreateDate = GetPersianDate(DateTime.Now);
                //m_model.MembersProfiles.InsertOnSubmit(profile);
                #endregion
                #region Add Employee
                MembersEmployee employee = m_model.MembersEmployees.Single(P => P.MemberID.Equals(userId));
                employee.Contract = int.Parse(NewMemberContractType);
                employee.From = NewMemberEmployeeDateYear + ":" + NewMemberEmployeeDateMonth + ":" + NewMemberEmployeeDateDay;
                employee.Job = int.Parse(NewMemberJobType);
                employee.JobState = int.Parse(NewMemberJobStatus);
                //employee.MemberID = userId;
                employee.Organization = int.Parse(NewMemberJobConcept);
                employee.University = int.Parse(NewMemberJob3University);
                employee.JobOtherType = int.Parse(NewMemberOthertype);
                employee.JobName = NewMemberJobName;
                employee.JobPlace = NewMemberJobPlace;

                // m_model.MembersEmployees.InsertOnSubmit(employee);
                #endregion
                #region Isargari
                var isargaries = m_model.MembersIsargaris.Where(P => P.MemberID.Equals(userId));
                m_model.MembersIsargaris.DeleteAllOnSubmit(isargaries);
                if (NewMemberIsAzadeh)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 1;
                    isargari.IsargariValue = NewMemberEsratDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsChildOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 6;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsFamilyOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 5;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsJanbaz)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 2;
                    isargari.IsargariValue = NewMemberJanbaziPercent;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsIsargar)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 4;
                    isargari.IsargarRelation = NewMemberIsargariIsargarFamilyType;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                else if (NewMemberIsRazmande)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 3;
                    isargari.IsargariValue = NewMemberJebheDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                #endregion
                #region Contacts
                MemberContact contacts = m_model.MemberContacts.Single(P => P.MemberID.Equals(userId));
                contacts.Email = ProfileEmail;
                contacts.HomePhone = ProfileHomePhone;
                contacts.WorkPhone = ProfileWorkPhone;
                contacts.MobilePhone = ProfileMobile;
                // contacts.MemberID = userId;
                //m_model.MemberContacts.InsertOnSubmit(contacts);
                #endregion

                m_model.SubmitChanges();

                #region Apply Picture
                if (!NewMemberPictureName.ToLower().Trim().Equals("default"))
                {
                    String lastName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), NewMemberPictureName);
                    String newName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), userName + ".png");
                    FileInfo f = new FileInfo(lastName);
                    if (f.Exists)
                    {
                        if (new FileInfo(newName).Exists)
                            System.IO.File.Delete(newName);
                        if (f.Exists)
                        {
                            System.IO.File.Copy(lastName, newName);
                            System.IO.File.Delete(lastName);
                        }

                        lastName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), NewMemberPictureName);
                        newName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), userName + ".png");
                        f = new FileInfo(lastName);
                        if (new FileInfo(newName).Exists)
                            System.IO.File.Delete(newName);
                        if (f.Exists)
                        {
                            System.IO.File.Copy(lastName, newName);
                            System.IO.File.Delete(lastName);
                        }
                    }
                }
                #endregion
                return Success(33);
            }
            catch (Exception ex)
            {
                if (Membership.GetUser(ProfileNationalityCode) != null)
                    Membership.DeleteUser(ProfileNationalityCode);
                return Json(new { Status = false, Message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult EditGeneralInfo(string ProfileFirstName, string ProfileLastName, string ProfileGender,
            string ProfileDegree, string ProfileNationalityCode, string ProfileShenasnameCode, string ProfileShenasnamePlace,
            string ProfilePersonID, string ProfileBirthdateDay, string ProfileBirthdateMonth, string ProfileBirthdateYear, string ProfileCity)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion
                #region Edit Profile
                MembersProfile profile = m_model.MembersProfiles.Single(P => P.MemberID.Equals(userId));
                //profile.MemberID = userId;
                profile.PersonalNumber = ProfilePersonID;
                profile.LastName = ProfileLastName;
                profile.FirstName = ProfileFirstName;
                profile.DegreeID = int.Parse(ProfileDegree);
                profile.CityID = int.Parse(ProfileCity);
                profile.BirthDate = ProfileBirthdateYear + ":" + ProfileBirthdateMonth + ":" + ProfileBirthdateDay;
                profile.Gender = int.Parse(ProfileGender) == 0 ? false : true;
                profile.IDCard = ProfileShenasnameCode;
                profile.IDCardPlace = ProfileShenasnamePlace;
                #endregion
                m_model.SubmitChanges();
                return Success(40);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult EditContactInfo(string ProfileNationalityCode, string ProfileMobile, string ProfileHomePhone, string ProfileWorkPhone, string ProfileEmail)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion
                #region Edit Contacts
                MemberContact contacts = m_model.MemberContacts.Single(P => P.MemberID.Equals(userId));
                contacts.Email = ProfileEmail;
                contacts.HomePhone = ProfileHomePhone;
                contacts.WorkPhone = ProfileWorkPhone;
                contacts.MobilePhone = ProfileMobile;
                m_model.SubmitChanges();
                #endregion
                return Success(41);

            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        [HttpPost]
        public ActionResult EditMemberJob(string ProfileNationalityCode, string NewMemberEmployeeDateDay, string NewMemberEmployeeDateYear, string NewMemberEmployeeDateMonth,
            string NewMemberContractType, string NewMemberJobType, string NewMemberJobConcept, string NewMemberJobStatus,
            string NewMemberJob3University, string NewMemberjobName, string NewMemberJobPlace, string NewMemberOthertype)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion
                #region Edit Employee

                MembersEmployee employee = m_model.MembersEmployees.Single(P => P.MemberID.Equals(userId));
                employee.Contract = int.Parse(NewMemberContractType);
                employee.From = NewMemberEmployeeDateYear + ":" + NewMemberEmployeeDateMonth + ":" + NewMemberEmployeeDateDay;
                employee.Job = int.Parse(NewMemberJobType);
                employee.JobState = int.Parse(NewMemberJobStatus);
                //employee.MemberID = userId;
                employee.Organization = int.Parse(NewMemberJobConcept);
                employee.University = int.Parse(NewMemberJob3University);
                employee.JobOtherType = int.Parse(NewMemberOthertype);
                employee.JobName = NewMemberjobName;
                employee.JobPlace = NewMemberJobPlace;
                m_model.SubmitChanges();

                #endregion
                return Success(42);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult EditMemberIsargari(string ProfileNationalityCode, string NewMemberIsargariType, string NewMemberEsratDuration,
            string NewMemberJanbaziPercent, string NewMemberJebheDuration, string NewMemberIsargariIsargarFamilyType,
           bool NewMemberIsAzadeh, bool NewMemberIsJanbaz, bool NewMemberIsRazmande, bool NewMemberIsIsargar,
            bool NewMemberIsFamilyOfShahid, bool NewMemberIsChildOfShahid)
        {
            try
            {
                #region Get User
                String userName = ProfileNationalityCode;
                var user = Membership.GetUser(userName);
                if (user == null)
                {
                    return Error(38);
                }
                var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(user.UserName)).UserId;
                #endregion

                #region Isargari
                var isargaries = m_model.MembersIsargaris.Where(P => P.MemberID.Equals(userId));
                m_model.MembersIsargaris.DeleteAllOnSubmit(isargaries);
                if (NewMemberIsAzadeh)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 1;
                    isargari.IsargariValue = NewMemberEsratDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsChildOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 6;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsFamilyOfShahid)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 5;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsJanbaz)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 2;
                    isargari.IsargariValue = NewMemberJanbaziPercent;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                if (NewMemberIsIsargar)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 4;
                    isargari.IsargarRelation = NewMemberIsargariIsargarFamilyType;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                else if (NewMemberIsRazmande)
                {
                    MembersIsargari isargari = new MembersIsargari();
                    isargari.MemberID = userId;
                    isargari.IsargariType = 3;
                    isargari.IsargariValue = NewMemberJebheDuration;
                    m_model.MembersIsargaris.InsertOnSubmit(isargari);
                }
                m_model.SubmitChanges();
                return Success(43);
                #endregion
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region  Check Nationality Code
        [HttpGet]
        public ActionResult IsExistUser(string nationalityCode)
        {
            try
            {
                var Result = Membership.GetUser(nationalityCode);
                if (Result == null)
                    return Success(38);
                else return Success(2);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetUserSummery
        [HttpGet]
        public ActionResult GetUserSummery(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {

                    var Contact = (from p in m_model.MemberContacts
                                   where p.aspnet_User.UserName.Equals(userName)
                                   select new
                                   {
                                       Phone = p.HomePhone,
                                       Mobile = p.MobilePhone,
                                       Work = p.WorkPhone
                                   }).ToList();
                    var job = (from p in m_model.MembersEmployees
                               where p.aspnet_User.UserName.Equals(userName)
                               select new
                               {
                                   IsUniversityOfTehran = p.University,
                                   JobName = p.JobName,
                                   JobPlace = p.JobPlace
                               }).ToList();

                    var Result = (from p in m_model.MembersProfiles
                                  where p.aspnet_User.UserName.Equals(userName)
                                  select new
                                  {
                                      ID = p.aspnet_User.UserName,
                                      FirstName = p.FirstName,
                                      LastName = p.LastName,
                                      IDCard = p.IDCard,
                                      IDPlacce = p.IDCardPlace,
                                      PersonalNumber = p.PersonalNumber,
                                      Gender = p.Gender,
                                      City = p.CityID,
                                      BirthDate = p.BirthDate,
                                      Degree = p.DegreeID,
                                      IsUniversityOfTehran = job.Count > 0 ? job[0].IsUniversityOfTehran : 0,
                                      JobName = job.Count > 0 ? job[0].JobName : "",
                                      JobPlace = job.Count > 0 ? job[0].JobPlace : "",
                                      Phone = Contact.Count > 0 ? Contact[0].Phone : "",
                                      Mobile = Contact.Count > 0 ? Contact[0].Mobile : "",
                                      Work = Contact.Count > 0 ? Contact[0].Work : ""
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = 39, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region LoadUserDetails
        [HttpGet]
        public ActionResult GetUserGeneralInfo(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    bool activity = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).aspnet_Membership.IsApproved;
                    var Result = (from p in m_model.MembersProfiles
                                  where p.aspnet_User.UserName.Equals(userName)
                                  select new
                                  {
                                      ID = p.aspnet_User.UserName,
                                      FirstName = p.FirstName,
                                      LastName = p.LastName,
                                      IDCard = p.IDCard,
                                      IDPlacce = p.IDCardPlace,
                                      PersonalNumber = p.PersonalNumber,
                                      Gender = p.Gender,
                                      City = p.CityID,
                                      BirthDate = p.BirthDate,
                                      Degree = p.DegreeID,
                                      Activity = activity,
                                      Point = p.Point,
                                      Rank = p.Rank,
                                      GuId = p.MemberID,
                                      documentCode = p.DocumentCode
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = 39, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetUserContactInfo
        [HttpGet]
        public ActionResult GetUserContactInfo(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var Result = (from p in m_model.MemberContacts
                                  where p.aspnet_User.UserName.Equals(userName)
                                  select new
                                  {
                                      PhoneNumber = p.HomePhone,
                                      EMail = p.Email,
                                      Mobile = p.MobilePhone,
                                      WorkPhone = p.WorkPhone
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = 39, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetUserIsargariInfo
        [HttpGet]
        public ActionResult GetUserIsargariInfo(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var Result = (from p in m_model.MembersIsargaris
                                  where p.aspnet_User.UserName.Equals(userName)
                                  select new
                                  {
                                      IsargariType = p.IsargariType,
                                      IsargariValue = p.IsargariValue,
                                      IsargariRelation = p.IsargarRelation
                                  }).ToList();
                    return Json(new { Status = true, Message = 39, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetUserJobInfo
        [HttpGet]
        public ActionResult GetUserJobInfo(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var Result = (from p in m_model.MembersEmployees
                                  where p.aspnet_User.UserName.Equals(userName)
                                  select new
                                  {

                                      Contract = p.Contract,
                                      FromDate = p.From,
                                      JobType = p.Job,
                                      JobName = p.JobName == null ? "-" : p.JobPlace,
                                      JobOtherType = p.JobOtherType == null ? 0 : p.JobOtherType,
                                      JobPlace = p.JobPlace == null ? "-" : p.JobPlace,
                                      JobState = p.JobState,
                                      Concept = p.Organization,
                                      University = p.University
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = 39, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetChildrens
        [HttpGet]
        public ActionResult GetListOfChildrens(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var Result = from p in m_model.MembersRelations
                                 where p.MembershipID.Equals(userId) && p.RelationType == 0
                                 select new
                                 {
                                     FirstName = p.FirstName,
                                     LastName = p.LastName,
                                     Gender = p.Gender,
                                     InternationalCode = p.InternationalCode,
                                     Phone = p.Tel
                                 };
                    return Json(new { Status = true, Message = 44, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetMates
        [HttpGet]
        public ActionResult GetListOfMates(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var Result = from p in m_model.MembersRelations
                                 where p.MembershipID.Equals(userId) && p.RelationType == 1
                                 select new
                                 {
                                     FirstName = p.FirstName,
                                     LastName = p.LastName,
                                     Gender = p.Gender,
                                     InternationalCode = p.InternationalCode,
                                     Phone = p.Tel,
                                     JobName = p.JobName,
                                     JobPlace = p.JobPlace
                                 };
                    return Json(new { Status = true, Message = 45, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetCausins
        [HttpGet]
        public ActionResult GetListOfCausin(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var Result = from p in m_model.MembersRelations
                                 where p.MembershipID.Equals(userId) && p.RelationType == 2
                                 select new
                                 {
                                     FirstName = p.FirstName,
                                     LastName = p.LastName,
                                     Gender = p.Gender,
                                     InternationalCode = p.InternationalCode,
                                     Age = p.Age,
                                     Relation = p.Relation
                                 };
                    return Json(new { Status = true, Message = 46, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region GetListOfMembers
        public String GetPersianDate(DateTime now)
        {
            System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
            String tempdate = jc.GetYear(now) + ":" + jc.GetMonth(now) + ":" + jc.GetDayOfMonth(now);
            return tempdate;
        }

        public DateTime GetPersianDateInstance(DateTime now)
        {
            System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
            String tempdate = jc.GetYear(now) + ":" + jc.GetMonth(now) + ":" + jc.GetDayOfMonth(now);
            return new DateTime(jc.GetYear(now), jc.GetMonth(now), jc.GetDayOfMonth(now), jc);
        }
        private KeyValuePair<double, double> CalculateUserPoint(Guid userId)
        {
            try
            {
                KeyValuePair<double, double> Result = new KeyValuePair<double, double>(0.0, 0.0);
                double result = 0;
                if (m_model.Payments.Count(P => P.MemberID.Equals(userId)) <= 0)
                {
                    result = 0;
                    return Result;
                }
                else
                {
                    var payments = m_model.Payments.Where(P => P.MemberID.Equals(userId));
                    System.Globalization.PersianCalendar persian = new System.Globalization.PersianCalendar();
                    double sum = 0;
                    foreach (var x in payments)
                    {
                        String[] dates = x.DateOfPayment.Split(new char[] { '/' });
                        DateTime tempDateTime = new DateTime(int.Parse(dates[0]), int.Parse(dates[1]), int.Parse(dates[2]), persian);
                        DateTime tempNowDate = GetPersianDateInstance(DateTime.Now);
                        double days = (tempNowDate - tempDateTime).TotalDays;
                        double f = double.Parse(x.Fee);
                        double moneyWeight = f / 100000.0;
                        sum += f;
                        result += days * moneyWeight;
                    }
                    return new KeyValuePair<double, double>(Math.Round(result / 100.00, 2), sum);
                }
            }
            catch (Exception ex)
            {
                return new KeyValuePair<double, double>(0.0, 0.0);
            }
        }
        private long GetPaymentByUser(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var payments = m_model.Payments.Where(P => P.MemberID.Equals(userId));
                    long result = 0;
                    foreach (var x in payments)
                    {
                        result += long.Parse(x.Fee);
                    }
                    return result;
                }
                else
                {
                    return -1;
                }
            }
            catch (Exception ex)
            {
                return -1;
            }
        }


        [HttpGet]
        public ActionResult GetTotalPaymentByUser(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var payments = m_model.Payments.Where(P => P.MemberID.Equals(userId));
                    long result = 0;
                    foreach (var x in payments)
                    {
                        result += long.Parse(x.Fee);
                    }
                    return Json(new { Status = true, Message = 37, Result = new { TotalFee = result } }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        [HttpGet]
        public ActionResult GetListOfMembers()
        {
            try
            {
                System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
                String tempdate = jc.GetYear((DateTime)DateTime.Now) + ":" + jc.GetMonth((DateTime)DateTime.Now) + ":" + jc.GetDayOfMonth((DateTime)DateTime.Now);
                var Result = (from p in m_model.MembersProfiles
                              where p.IsDisabled == null || p.IsDisabled == false
                              select new
                              {
                                  FirstName = p.FirstName,
                                  LastName = p.LastName,
                                  UserId = p.MemberID,
                                  UserName = p.InternationalCode,
                                  NationalityCode = p.InternationalCode,
                                  Point = p.Point,
                                  Rank = p.Rank,
                                  Date = p.CreateDate != null ? p.CreateDate : tempdate,
                                  IsApproved = p.aspnet_User.aspnet_Membership.IsApproved,
                                  TotalPayment = p.Payment,
                                  DocumentCode = p.DocumentCode
                              }).ToList();

                return Json(new { Status = true, Message = 37, Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult GetMember(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
                    String tempdate = jc.GetYear((DateTime)DateTime.Now) + ":" + jc.GetMonth((DateTime)DateTime.Now) + ":" + jc.GetDayOfMonth((DateTime)DateTime.Now);
                    var Result = (from p in m_model.MembersProfiles
                                  where p.MemberID.Equals(userId)
                                  select new
                                  {
                                      UserId = p.MemberID,
                                      NationalityCode = p.InternationalCode,
                                      FirstName = p.FirstName,
                                      LastName = p.LastName,
                                      Date = p.CreateDate != null ? p.CreateDate : tempdate,
                                      IsApproved = p.aspnet_User.aspnet_Membership.IsApproved,
                                      Point = p.Point,
                                      Rank = p.Rank,
                                      TotalPayment = p.Payment,
                                      DocumentCode = p.DocumentCode
                                  }).ToList()[0];
                    return Json(new { Status = true, Message = 37, Result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Add Child
        [HttpPost]
        public ActionResult AddChild(string userName, string ChildFirstName, string ChildLastName, int ChildGenderType, string ChildInternationalCode, string ChildPhone)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.MembersRelations.Count(P => P.MembershipID.Equals(userId) && P.InternationalCode.Equals(ChildInternationalCode)) > 0)
                    {
                        return Error(49);
                    }
                    MembersRelation relation = new MembersRelation();
                    relation.FirstName = ChildFirstName;
                    relation.LastName = ChildLastName;
                    relation.InternationalCode = ChildInternationalCode;
                    relation.Gender = ChildGenderType;
                    relation.Tel = ChildPhone;
                    relation.RelationType = 0;
                    relation.MembershipID = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    m_model.MembersRelations.InsertOnSubmit(relation);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 34 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Add Hamsar
        [HttpPost]
        public ActionResult AddHamsar(string userName, string NewHamsarFirstName, string NewHamsarLastName, int NewHamsarGenderType, string NewHamsarInternationalCode, string NewHamsarPhone, string NewHamsarJob, string NewHamsarJobPlace)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.MembersRelations.Count(P => P.MembershipID.Equals(userId) && P.InternationalCode.Equals(NewHamsarInternationalCode)) > 0)
                    {
                        return Error(50);
                    }
                    MembersRelation relation = new MembersRelation();
                    relation.FirstName = NewHamsarFirstName;
                    relation.LastName = NewHamsarLastName;
                    relation.InternationalCode = NewHamsarInternationalCode;
                    relation.Gender = NewHamsarGenderType;
                    relation.Tel = NewHamsarPhone;
                    relation.RelationType = 1;
                    relation.JobPlace = NewHamsarJob;
                    relation.JobName = NewHamsarJobPlace;
                    relation.MembershipID = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    m_model.MembersRelations.InsertOnSubmit(relation);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 35 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Add Causin
        [HttpPost]
        public ActionResult AddCausin(string userName, string NewCausinFirstName, string NewCausinLastName, int NewCausinGenderType, string NewCausinInternationalCode, string NewCausinRelation, int NewCausinAge)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.MembersRelations.Count(P => P.MembershipID.Equals(userId) && P.InternationalCode.Equals(NewCausinInternationalCode)) > 0)
                    {
                        return Error(51);
                    }
                    MembersRelation relation = new MembersRelation();
                    relation.FirstName = NewCausinFirstName;
                    relation.LastName = NewCausinLastName;
                    relation.InternationalCode = NewCausinInternationalCode;
                    relation.Gender = NewCausinGenderType;
                    relation.RelationType = 2;
                    relation.Relation = NewCausinRelation;
                    relation.MembershipID = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    relation.Age = NewCausinAge;
                    m_model.MembersRelations.InsertOnSubmit(relation);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 36 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region DeleteRelation
        [HttpGet]
        public ActionResult DeleteRelation(string userName, string relationId)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.MembersRelations.Count(P => P.MembershipID.Equals(userId) && P.InternationalCode.Equals(relationId)) > 0)
                    {
                        var Rel = m_model.MembersRelations.Single(P => P.MembershipID.Equals(userId) && P.InternationalCode.Equals(relationId));
                        m_model.MembersRelations.DeleteOnSubmit(Rel);
                        m_model.SubmitChanges();
                        return Success(48);
                    }
                    else
                    {
                        return Error(47);
                    }
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Upload Profile Picture
        [HttpPost]
        public ContentResult UploadPicture()
        {
            try
            {
                string userName = Guid.NewGuid().ToString();
                var r = new List<ViewDataUploadFilesResult>();
                foreach (string file in Request.Files)
                {
                    HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                    if (hpf.ContentLength == 0)
                        continue;

                    System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                    string savedFileName = Path.Combine(Server.MapPath("~/Pics/Users/Originals"), userName);
                    string savedThumbnailName = Path.Combine(Server.MapPath("~/Pics/Users/Thumbnails"), userName);
                    bmp.Save(savedFileName + ".png", System.Drawing.Imaging.ImageFormat.Png);


                    double aspectRatio = 160.0 / (double)bmp.Width;

                    int width = (int)(160);
                    int height = (int)((double)bmp.Height * aspectRatio);
                    System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                    System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                    gr.DrawImage(bmp, 0, 0, width, height);

                    newPic.Save(savedThumbnailName + ".png", System.Drawing.Imaging.ImageFormat.Png);

                    gr.Dispose();
                    newPic.Dispose();
                    bmp.Dispose();

                    r.Add(new ViewDataUploadFilesResult()
                    {
                        Name = userName + ".png",
                        Length = hpf.ContentLength,
                        Type = hpf.ContentType,
                        Id = 0
                    });
                }
                // Returns json

                return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
            }
            catch (Exception ex)
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }

        #endregion
        #region Helper Class
        public class ViewDataUploadFilesResult
        {
            public int Id;
            public String Name;
            public String Type;
            public int Length;
        }

        [Serializable]
        public class MemberField
        {
            public String ProfileFirstName;//: $("#ProfileFirstName").val(),
            public String ProfileLastName;//: $("#ProfileLastName").val(),
            public String ProfileGender;//: $("#ProfileGender").val(),
            public String ProfileDegree;//: $("#ProfileDegree").val(),
            public String ProfileNationalityCode;// : $("#ProfileNationalityCode").val(),
            public String ProfileShenasnameCode;//: $("#ProfileShenasnameCode").val(),
            public String ProfileShenasnamePlace;//: $("#ProfileShenasnamePlace").val(),
            public String ProfilePersonID;//: $("#ProfilePersonID").val(),
            public String ProfileBirthdateDay;//: $("#ProfileBirthdateDay").val(),
            public String ProfileBirthdateMonth;//: $("#ProfileBirthdateMonth").val(),
            public String ProfileBirthdateYear;//: $("#ProfileBirthdateYear").val(),
            public String ProfileMobile;// $("#ProfileMobile").val(),
            public String ProfileHomePhone;//: $("#ProfileHomePhone").val(),
            public String ProfileWorkPhone;//: $("#ProfileWorkPhone").val(),
            public String ProfileEmail;//;// : $("#ProfileEmail").val(),
            public String ProfileCity;//: $("#ProfileCity").val(),
            public String NewMemberEmployeeDateDay;//: $("#NewMemberEmployeeDateDay").val(),
            public String NewMemberEmployeeDateYear;//: $("#NewMemberEmployeeDateYear").val(),
            public String NewMemberEmployeeDateMonth;//: $("#NewMemberEmployeeDateMonth").val(),
            public String NewMemberContractType;// : $("#NewMemberJob3ContractType").val(),
            public String NewMemberJobType;//: $("#NewMemberJob3Types").val(),
            public String NewMemberJobConcept;// : $("#NewMemberJob1Concept").val(),
            public String NewMemberJobStatus;// : $("#NewMemberJobStatus").val(),
            public String NewMemberJob3University;//: $("#NewMemberJob3University").val(),
            public String NewMemberIsargariType;// : $("#NewMemberIsargariType").val(),
            public String NewMemberEsratDuration;// : $("#NewMemberEsratDuration").val(),
            public String NewMemberJanbaziPercent;
            public String NewMemberJebheDuration;
            public String NewMemberIsargariIsargarFamilyType;
            public String NewMemberPictureName;
        }
        #endregion
        #region User Payment
        [Authorize(Roles = "Admin, ViewRoles, ViewUsers")]
        [HttpPost]
        public ActionResult AddPaymentForUser(string userName, string PaymentCode, string PaymentFee, int PaymentDateDay, int PaymentDateMonth, int PaymentDateYear, string PaymentBank, int PaymentMethod)
        {
            String tmpPayment = PaymentFee;
            PaymentFee = "";
            foreach (var ch in tmpPayment)
                if (ch != ',')
                    PaymentFee += ch;

            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.Payments.Count(P => P.ReceiptID == PaymentCode && P.MemberID.Equals(userId)) > 0)
                    {
                        return Error(61);
                    }
                    else
                    {
                        Payment payment = new Payment();
                        payment.MemberID = userId;
                        payment.PaymentMethod = PaymentMethod;
                        payment.ReceiptID = PaymentCode;
                        payment.Fee = PaymentFee;
                        payment.DestinationBank = PaymentBank;
                        payment.SourceBank = PaymentBank;
                        payment.DateofEntry = DateTime.Now;
                        payment.DateOfPayment = PaymentDateYear + "/" + PaymentDateMonth + "/" + PaymentDateDay;
                        m_model.Payments.InsertOnSubmit(payment);
                        m_model.SubmitChanges();
                        return Json(new { Result = payment.ID, Status = true, Message = 36 }, JsonRequestBehavior.AllowGet);
                    }
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        [Authorize(Roles = "Admin, ViewRoles, ViewUsers")]
        [HttpPost]
        public ActionResult UpdatePayment(string userName, string PaymentId, string PaymentCode, string PaymentFee, int PaymentDateDay, int PaymentDateMonth, int PaymentDateYear, string PaymentBank, int PaymentMethod)
        {
            String tmpPayment = PaymentFee;
            PaymentFee = "";
            foreach (var ch in tmpPayment)
                if (ch != ',')
                    PaymentFee += ch;
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.Payments.Count(P => P.ID == int.Parse(PaymentId)) > 0)
                    {
                        Payment payment = m_model.Payments.Single(P => P.ID == int.Parse(PaymentId));
                        payment.MemberID = userId;
                        payment.SourceBank = PaymentBank;
                        payment.PaymentMethod = PaymentMethod;
                        payment.ReceiptID = PaymentCode;
                        payment.Fee = PaymentFee;
                        payment.DestinationBank = PaymentBank;
                        payment.DateOfPayment = PaymentDateYear + "/" + PaymentDateMonth + "/" + PaymentDateDay;
                        m_model.SubmitChanges();
                        return Json(new { Result = payment.ID, Status = true, Message = 36 }, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        return Error(40);
                    }
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        [Authorize(Roles = "Admin, ViewRoles, ViewUsers")]
        [HttpGet]
        public ActionResult DeletePayment(string userName, string paymentId)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    if (m_model.Payments.Count(P => P.MemberID.Equals(userId) && P.ID == int.Parse(paymentId)) > 0)
                    {
                        var payment = m_model.Payments.Single(P => P.MemberID.Equals(userId) && P.ID == int.Parse(paymentId));
                        m_model.Payments.DeleteOnSubmit(payment);
                        m_model.SubmitChanges();
                        return Success(62);
                    }
                    else
                    {
                        return Error(47);
                    }
                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult GetUserRole()
        {
            try
            {
                if (Request.IsAuthenticated == false)
                {
                    return Error(30);
                }
                else
                {
                    String userName = User.Identity.Name;
                    var Resuserult = Membership.GetUser(userName);
                    var Result = Roles.GetRolesForUser();
                    return Json(new { Result, Status = true, Message = 36 }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin, Member, User, Viewer")]
        [HttpGet]
        public ActionResult GetListOfPayment(string userName)
        {
            try
            {
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var Result = (from p in m_model.Payments
                                  where p.MemberID.Equals(userId)
                                  select new
                                  {
                                      PaymentID = p.ID,
                                      PaymentDate = p.DateOfPayment,
                                      PaymentFee = p.Fee,
                                      PaymentBank = p.DestinationBank,
                                      PaymentMethod = p.PaymentMethod,
                                      PaymentCode = p.ReceiptID
                                  }).ToList();
                    return Json(new { Status = true, Message = 63, Result }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }


        [Authorize(Roles = "Admin, Viewer")]
        [HttpGet]
        public ActionResult GetTotalPayment()
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var payments = m_model.Payments;
                    long result = 0;
                    System.Threading.Tasks.Parallel.ForEach(payments, payment => { result += long.Parse(payment.Fee); });
                    return Json(new { Status = true, Message = 63, result, count = m_model.Payments.Count() }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Public area api
        #region album region
        [Authorize(Roles = "Admin, Album")]
        [HttpPost]
        public ActionResult CreateNewAlbum(string albumName, string albumDesc)
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    Album newAlbum = new Album();
                    newAlbum.CreateDate = DateTime.Now;
                    newAlbum.CreatorId = userId;
                    newAlbum.Explanation = albumDesc;
                    newAlbum.Name = albumName;
                    newAlbum.State = true;

                    m_model.Albums.InsertOnSubmit(newAlbum);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 63, Result = newAlbum }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin, Album")]
        [HttpGet]
        public ActionResult ChangeAlbumState(string albumId, string albumState)
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var album = m_model.Albums.Single(P => P.Id.Equals(int.Parse(albumId)));
                    album.State = bool.Parse(albumState);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 63 }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        private String GetAlbumPoster(int albumId)
        {
            if (m_model.PicOfAlbums.Count(P => P.AlbumId == albumId) > 0)
            {
                return m_model.PicOfAlbums.First(P => P.AlbumId == albumId).Path;
            }
            else return "default";
        }

        [HttpGet]
        public ActionResult getListOfAlbums()
        {
            try
            {
                var Result = from p in m_model.Albums
                             where p.State == true
                             select new
                             {
                                 Name = p.Name,
                                 Id = p.Id,
                                 Explanation = p.Explanation,
                                 CreateDate = GetPersianDate((DateTime)p.CreateDate),
                                 ImageTitlePoster = GetAlbumPoster(p.Id),
                                 State = p.State
                             };
                return Json(new { Status = true, Message = 63, Result }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult getListOfImages(int albumId)
        {
            try
            {
                if (m_model.Albums.Count(P => P.Id == albumId) > 0)
                {
                    return Json(
                        new
                        {
                            Status = true,
                            Message = 63,
                            Result = m_model.PicOfAlbums.Where(P => P.State == true && P.AlbumId == (albumId))
                        }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Error(68);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin, Album")]
        [HttpPost]
        public ActionResult EditAlbum(int albumId, string albumDesc, string albumName)
        {
            try
            {
                if (m_model.Albums.Count(P => P.Id == albumId) > 0)
                {
                    var album = m_model.Albums.Single(P => P.Id == albumId);
                    album.Name = albumName;
                    album.Explanation = albumDesc;
                    m_model.SubmitChanges();
                    return Success(70);
                }
                else
                {
                    return Error("Album does not exist");
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [Authorize(Roles = "Admin, Album")]
        [HttpGet]
        public ActionResult DeleteAlbum(string albumId)
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var album = m_model.Albums.Single(P => P.Id.Equals(int.Parse(albumId)));
                    album.State = false;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 63 }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }


        [Authorize(Roles = "Admin, Album")]
        [HttpGet]
        public ActionResult DeleteImage(int imageId)
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    Guid userId = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName)).UserId;
                    var image = m_model.PicOfAlbums.Single(P => P.Id.Equals(imageId));
                    image.State = false;
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = 63 }, JsonRequestBehavior.AllowGet);

                }
                else
                {
                    return Error(38);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }


        [Authorize(Roles = "Admin, Album")]
        [HttpPost]
        public ContentResult AddPictureToAlbum(string albumId, string desc)
        {
            try
            {
                String userName = User.Identity.Name;
                if (m_model.aspnet_Users.Count(P => P.UserName.Equals(userName)) > 0)
                {
                    var user = m_model.aspnet_Users.Single(P => P.UserName.Equals(userName));
                    if (m_model.Albums.Count(P => P.Id.Equals(int.Parse(albumId))) <= 0)
                    {
                        return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "Album not found" + "\"}", "application/json");
                    }

                    var album = m_model.Albums.Single(P => P.Id.Equals(int.Parse(albumId)));


                    string tmpId = Guid.NewGuid().ToString();
                    var r = new List<ViewDataUploadFilesResult>();
                    foreach (string file in Request.Files)
                    {
                        PicOfAlbum newPicture = new PicOfAlbum();
                        HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                        if (hpf.ContentLength == 0)
                            continue;

                        System.Drawing.Image bmp = System.Drawing.Bitmap.FromStream(hpf.InputStream);

                        string savedFileName = Path.Combine(Server.MapPath("~/Pics/Albums/Originals"), tmpId);
                        string savedThumbnailName = Path.Combine(Server.MapPath("~/Pics/Albums/Thumbnails"), tmpId);
                        bmp.Save(savedFileName + ".png", System.Drawing.Imaging.ImageFormat.Png);


                        double aspectRatio = 160.0 / (double)bmp.Width;

                        int width = (int)(160);
                        int height = (int)((double)bmp.Height * aspectRatio);
                        System.Drawing.Bitmap newPic = new System.Drawing.Bitmap(width, height);

                        System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(newPic);
                        gr.DrawImage(bmp, 0, 0, width, height);

                        newPic.Save(savedThumbnailName + ".png", System.Drawing.Imaging.ImageFormat.Png);

                        gr.Dispose();
                        newPic.Dispose();
                        bmp.Dispose();

                        r.Add(new ViewDataUploadFilesResult()
                        {
                            Name = tmpId + ".png",
                            Length = hpf.ContentLength,
                            Type = hpf.ContentType,
                            Id = 0
                        });

                        newPicture.AlbumId = album.Id;
                        newPicture.CreatorId = user.UserId;
                        newPicture.CreateDate = DateTime.Now;
                        newPicture.Desc = desc;
                        newPicture.State = true;
                        newPicture.Path = tmpId + ".png";
                        m_model.PicOfAlbums.InsertOnSubmit(newPicture);
                        m_model.SubmitChanges();
                    }
                    // Returns json

                    return Content("{\"Status\":\"" + "true" + "\",\"Message\":\"" + "Your File Sent Sucessfully" + "\",\"Id\":\"" + r[0].Id + "\",\"Name\":\"" + r[0].Name + "\",\"Size\":\"" + r[0].Length + "\",\"Type\":\"" + r[0].Type + "\"}", "application/json");
                }
                else
                {
                    return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + "User not found" + "\"}", "application/json");
                }
            }
            catch (Exception ex)
            {
                return Content("{\"Status\":\"" + "false" + "\",\"Message\":\"" + ex.Message + "\"}", "application/json");
            }
        }

        #endregion
        #endregion
        #region CalcUserPoint
        [HttpGet]
        public ActionResult CalcAllPoints()
        {
            try
            {
                foreach (var x in m_model.MembersProfiles)
                {
                    if (x.IsDisabled == null || x.IsDisabled == false)
                    {
                        var calced = CalculateUserPoint((Guid)x.MemberID);
                        x.Point = calced.Key;
                        x.Payment = calced.Value;
                    }
                    else
                    {
                        x.Point = 0;
                        x.Payment = 0;
                    }
                }
                m_model.SubmitChanges();

                var rankList = m_model.MembersProfiles.OrderByDescending(P => P.Point);
                int index = 0;
                foreach (var x in rankList)
                {
                    x.Rank = index;
                    index++;
                }

                m_model.SubmitChanges();

                return Success(80);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region ReportingSystem
        public ActionResult GetListOfMembersExcel()
        {
            try
            {
                using (var excelPackage = new ExcelPackage())
                {
                    excelPackage.Workbook.Properties.Author = "Majid Sadeghi Alavijeh";
                    excelPackage.Workbook.Properties.Title = "لیست اعضا";
                    var sheet = excelPackage.Workbook.Worksheets.Add("لیست اعضا");
                    sheet.View.RightToLeft = true;
                    sheet.Name = "لیست اعضا";
                    using (ExcelRange r = sheet.Cells["A1:N1"])
                    {
                        r.Style.Font.SetFromFont(new Font("Tahoma", 14, FontStyle.Regular));
                        r.Style.Font.Color.SetColor(Color.White);
                        r.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.CenterContinuous;
                        r.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                        r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(23, 55, 93));
                        r.AutoFitColumns();
                    }
                    var rowIndex = 1;
                    var col = 1;
                    sheet.Cells[rowIndex, col++].Value = "نام";
                    sheet.Cells[rowIndex, col++].Value = "نام خانوادگی";
                    sheet.Cells[rowIndex, col++].Value = "کد";
                    sheet.Cells[rowIndex, col++].Value = "نام کاربری";
                    sheet.Cells[rowIndex, col++].Value = "کد ملی";
                    sheet.Cells[rowIndex, col++].Value = "امتیاز";
                    sheet.Cells[rowIndex, col++].Value = "رتبه";
                    sheet.Cells[rowIndex, col++].Value = "تاریخ عضویت";
                    sheet.Cells[rowIndex, col++].Value = "وضعیت تایید";
                    sheet.Cells[rowIndex, col++].Value = "کل مبلغ پرداختی" ;
                    sheet.Cells[rowIndex, col++].Value = "شماره پرونده";
                    sheet.Cells["A1:N1"].AutoFitColumns();
                    System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
                    String tempdate = jc.GetYear((DateTime)DateTime.Now) + ":" + jc.GetMonth((DateTime)DateTime.Now) + ":" + jc.GetDayOfMonth((DateTime)DateTime.Now);
                    var Result = (from p in m_model.MembersProfiles
                                  where p.IsDisabled == null || p.IsDisabled == false
                                  select new
                                  {
                                      FirstName = p.FirstName,
                                      LastName = p.LastName,
                                      UserId = p.MemberID,
                                      UserName = p.InternationalCode,
                                      NationalityCode = p.InternationalCode,
                                      Point = p.Point,
                                      Rank = p.Rank,
                                      Date = p.CreateDate != null ? p.CreateDate : tempdate,
                                      IsApproved = p.aspnet_User.aspnet_Membership.IsApproved ? "فعال" : "غیر فعال",
                                      TotalPayment = p.Payment,
                                      DocumentCode = p.DocumentCode
                                  }).ToList();

                    foreach (var item in Result)
                    {
                        col = 1;
                        rowIndex++;
                        sheet.Cells[rowIndex, col++].Value = item.FirstName;
                        sheet.Cells[rowIndex, col++].Value = item.LastName;
                        sheet.Cells[rowIndex, col++].Value = item.UserId;
                        sheet.Cells[rowIndex, col++].Value = item.UserName;
                        sheet.Cells[rowIndex, col++].Value = item.NationalityCode;
                        sheet.Cells[rowIndex, col++].Value = item.Point;
                        sheet.Cells[rowIndex, col++].Value = item.Rank;

                        sheet.Cells[rowIndex, col++].Value = item.Date;
                        sheet.Cells[rowIndex, col++].Value = item.IsApproved;
                        sheet.Cells[rowIndex, col++].Value = item.TotalPayment;
                        sheet.Cells[rowIndex, col++].Value = item.DocumentCode;
                    }


                    Response.ClearContent();
                    Response.BinaryWrite(excelPackage.GetAsByteArray());
                    Response.AddHeader("content-disposition", "attachment;filename=resultsss.xlsx");
                    Response.ContentType = "application/excel";
                    Response.Flush();
                    Response.End();
                    return Json("ok", JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult GetAllPaymentExcel()
        {
            try
            {
                using (var excelPackage = new ExcelPackage())
                {
                    excelPackage.Workbook.Properties.Author = "Majid Sadeghi Alavijeh";
                    excelPackage.Workbook.Properties.Title = "پرداخت ها";
                    var sheet = excelPackage.Workbook.Worksheets.Add("لیست پرداخت ها");
                    sheet.View.RightToLeft = true;
                    sheet.Name = "لیست پرداخت ها";
                    using (ExcelRange r = sheet.Cells["A1:N1"])
                    {
                        r.Style.Font.SetFromFont(new Font("Tahoma", 14, FontStyle.Regular));
                        r.Style.Font.Color.SetColor(Color.White);
                        r.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.CenterContinuous;
                        r.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                        r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(23, 55, 93));
                        r.AutoFitColumns();
                    }
                    var rowIndex = 1;
                    var col = 1;
                    sheet.Cells[rowIndex, col++].Value = "کد";
                    sheet.Cells[rowIndex, col++].Value = "شناسه پرداخت کننده";
                    sheet.Cells[rowIndex, col++].Value = "نام کاربری پرداخت کننده";
                    //sheet.Cells[rowIndex, col++].Value = "تاریخ ورود داده";
                    sheet.Cells[rowIndex, col++].Value = "تاریخ پرداخت";
                    sheet.Cells[rowIndex, col++].Value = "مبلغ";
                    sheet.Cells[rowIndex, col++].Value = "بانک مقصد";
                    sheet.Cells[rowIndex, col++].Value = "شماره فیش";
                    sheet.Cells[rowIndex, col++].Value = "بانک مبدا";
                    sheet.Cells["A1:N1"].AutoFitColumns();
                    System.Globalization.PersianCalendar jc = new System.Globalization.PersianCalendar();
                    String tempdate = jc.GetYear((DateTime)DateTime.Now) + ":" + jc.GetMonth((DateTime)DateTime.Now) + ":" + jc.GetDayOfMonth((DateTime)DateTime.Now);
                    var Result = (from p in m_model.Payments select p).ToList();

                    foreach (var item in Result)
                    {
                        col = 1;
                        rowIndex++;
                        sheet.Cells[rowIndex, col++].Value = item.ID;
                        sheet.Cells[rowIndex, col++].Value = item.MemberID;
                        sheet.Cells[rowIndex, col++].Value = item.aspnet_User.UserName;
                        //sheet.Cells[rowIndex, col++].Value = item.DateofEntry;
                        sheet.Cells[rowIndex, col++].Value = item.DateOfPayment;
                        sheet.Cells[rowIndex, col++].Value = item.Fee;
                        sheet.Cells[rowIndex, col++].Value = item.DestinationBank;
                        sheet.Cells[rowIndex, col++].Value = item.ReceiptID;
                        sheet.Cells[rowIndex, col++].Value = item.SourceBank;

                    }


                    Response.ClearContent();
                    Response.BinaryWrite(excelPackage.GetAsByteArray());
                    Response.AddHeader("content-disposition", "attachment;filename=resultsss.xlsx");
                    Response.ContentType = "application/excel";
                    Response.Flush();
                    Response.End();
                    return Json("ok", JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Projects    
        //Success code 120+
        [HttpPost]
        [Authorize]
        public ActionResult CreateProject(String projectName, String address, String beginDate, String endDate, String usefull, String share, String nou)
        {
            try
            {
                Project project = new Project();
                project.ProjectAddress = address;
                project.ProjectBeginDate = beginDate;
                project.ProjectEndDate = endDate;
                project.ProjectUsefullEnv = usefull;
                project.ProjectShare = share;
                project.ProjectUnits = nou;
                project.ProjectName = projectName;
                m_model.Projects.InsertOnSubmit(project);
                m_model.SubmitChanges();
                return Json(new { Status = true, Message = 120,  projectId = project.ProjectId}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        [Authorize]
        public ActionResult GetListOfProjects()
        {
            try
            {
                return Json(new { Status = true, Message = 121, Projects = m_model.Projects }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult AddShareToProject(String projectId, String id, String name, String value)
        {
            try
            {
                var count = m_model.Projects.Count(P=>P.ProjectId == int.Parse(projectId));
                if (count > 0)
                {
                    ProjectsShare share = new ProjectsShare();
                    share.ProjectId = int.Parse(projectId);
                    share.ShareId = int.Parse(id);
                    share.ShareName = name;
                    share.ShareValue = value;
                    m_model.ProjectsShares.InsertOnSubmit(share);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Added", Id = share.Id }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Project Not Found");
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult AddUnitToProject(String projectId, String unitId, String value, String trus, String wareHouseValue, String internalWareHouse, String Parking, String Location, String greenloby, String nob)
        {
            try
            {
                var count = m_model.Projects.Count(P => P.ProjectId == int.Parse(projectId));
                if (count > 0)
                {
                    ProjectUnit unit = new ProjectUnit();
                    unit.ProjectId = int.Parse(projectId);
                    unit.UnitGreenLoby = int.Parse(greenloby);
                    unit.UnitId = int.Parse(unitId);
                    unit.UnitInternalWareHouseValue = double.Parse(internalWareHouse);
                    unit.UnitLocation = Location;
                    unit.UnitNumberOfBeds = int.Parse(nob);
                    unit.UnitParking = int.Parse(Parking);
                    unit.UnitTrus = int.Parse(trus);
                    unit.UnitValue = double.Parse( value);
                    unit.UnitWareHousValue = double.Parse(wareHouseValue);
                    m_model.ProjectUnits.InsertOnSubmit(unit);
                    m_model.SubmitChanges();
                    return Json(new { Status = true, Message = "Added", Id = unit.Id }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Project Not Found");
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        [Authorize]
        public ActionResult GetProjectShares(String projectId)
        {
            try{
                var count = m_model.Projects.Count(P=>P.ProjectId == int.Parse(projectId));
                if (count > 0)
                {
                    var result = m_model.ProjectsShares.Where(P => P.ProjectId == int.Parse(projectId)).ToList();
                    return Json(new { Status = true, Message = "Successfully fetched", shares = result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Project Not Found");
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        [HttpGet]
        [Authorize]
        public ActionResult GetProjectUnits(String projectId)
        {
            try
            {
                var count = m_model.Projects.Count(P => P.ProjectId == int.Parse(projectId));
                if (count > 0)
                {
                    var result = m_model.ProjectUnits.Where(P => P.ProjectId == int.Parse(projectId)).ToList();
                    return Json(new { Status = true, Message = "Successfully fetched", units = result }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    throw new Exception("Project Not Found");
                }
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }
        #endregion
        #region Utility
        private void releaseObject(object obj)
        {
            try
            {
                System.Runtime.InteropServices.Marshal.ReleaseComObject(obj);
                obj = null;
            }
            catch (Exception ex)
            {
                obj = null;
                throw ex;
            }
            finally
            {
                GC.Collect();
            }
        }
        #endregion
    }
}