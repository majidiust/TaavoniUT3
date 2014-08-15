var BaseURL = "http://taavoniut3.ir";
var ServerURL = BaseURL + "/ServerSide/TavooniUT3/TavooniUT3/";
var version = 2;
var peymentMethod;
var IsFirstLogIn = true;
var userName;
var InvitedUsersList = [];
var NewSminar;
var EditInviteRowSeleted;
var DeleteInviteRowSeleted;
var MySeminars = [];
var TaavoniDataBase;
var chatBoardUpdaterID;
var LastMessageId;
var CurrentSeminarID;
var SelectedFileForDelete;
var CurrentSearchAccountPage;
var SeletectedUserAccount;
var SelectedUserFirstName;
var SelectedUserLastName;
var SelectedUserMobile;
var CurrentSlidePage;
var SeminarPrimaryContent;
var isMember = -1;
var index = -1;
var Membership;
var members = new Array();
var currentStep = 0;
var listOfChildrens = new Array();
var listOfMates = new Array();
var listOfEtc = new Array();
var listOfPayments = new Array();
var selectedTable;
var temporalPictureName = "default";
var fee;
var WebinarPoster;
var db;
var NewPaymentMethod = 1;
var selectedRow;
var selectedPaymentId;
var oTable;
var albumDialogType = 0;
$(document).load(function () {
    CustomBlockingPanel('توجه', 'لطفا اندکی صبر کنید.', -1, null);
});

$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });
    InitLocalStorage();
    LoadViews();
    var current_theme = $.cookie('current_theme') == null ? 'cerulean' : $.cookie('current_theme');
    switch_theme(current_theme);

    $('#themes a[data-value="' + current_theme + '"]').find('i').addClass('icon-ok');

    $('#themes a').click(function (e) {
        e.preventDefault();
        current_theme = $(this).attr('data-value');
        $.cookie('current_theme', current_theme, {
            expires: 365
        });
        switch_theme(current_theme);
        $('#themes i').removeClass('icon-ok');
        $(this).find('i').addClass('icon-ok');
    });


    function switch_theme(theme_name) {
        $('#bs-css').attr('href', 'css/bootstrap-' + theme_name + '.css');
    }

    //establish history variables
    var 
        History = window.History, // Note: We are using a capital H instead of a lower h
        State = History.getState(),
        $log = $('#log');

    //bind to State Change
    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        $.ajax({
            url: State.url,
            success: function (msg) {
                $('#content').html($(msg).find('#content').html());
                $('#loading').remove();
                $('#content').fadeIn();
                docReady();
            }
        });
    });

    //animating menus on hover
    $('ul.main-menu li:not(.nav-header)').hover(function () {
        $(this).animate({
            'margin-left': '+=5'
        }, 300);
    },

        function () {
            $(this).animate({
                'margin-left': '-=5'
            }, 300);
        });



    PrepareNewMember();
    //other things to do on document ready, seperated for ajax calls
    DetectLoggedInUser();
    ShowControlPanel(true);
    //  GetUserProfile();
    CloseAllForm();
    docReady();

    GetUserRoles();

    PrepareImageUploadForAlbum();
});

function InitLocalStorage() {
    console.log("Init Local Storage");
    DefineModels();
    $org.context = new $org.types.utdb({ name: "webSql", databaseName: "TaavoniDatabase", dbCreation: $data.storageProviders.DbCreationType.Default });
    $org.context.onReady(function () {
        console.log("Data base is ready");
    });
}

function DefineModels() {
    console.log("Define Models");
    $data.Entity.extend("$org.types.Member", {
        Id: { type: "int", key: true, computed: true },
        NationalityCode: { type: 'string', required: true },
        FirstName: { type: 'string', required: true },
        LastName: { type: 'string', required: true },
        CreateDate: { type: 'string', required: true },
        IsApproved: { type: 'string', required: true },
        Point: { type: 'string', required: true },
        Rank: { type: 'string', required: false },
        Payment: { type: 'string', required: false }
    });
    $data.EntityContext.extend("$org.types.utdb", {
        Members: { type: $data.EntitySet, elementType: $org.types.Member }
    });
}

function DataTableify() {
    $('.datatable').dataTable();
}

function GetTotalPayment() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات مالی ....', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetTotalPayment",
        dataType: 'json',
        success: function (result) {
            if (result.Status == true) {
                if (result.Message == 63) {
                    CustomAlert('توجه', "اطلاعات مالی دریافت شد", null);
                    $("#totalPaymentWindowFee").html(result.result + '  ریال  ');
                    $("#totalPaymentWindowFeeCount").html(result.count);
                    ShowBox("#TotalPaymentWindow");
                } else {
                    CustomAlert('توجه', "امکان دریافت اطلاعات مالی در این لحظه وجود ندارد", null);
                }
            } else {
                CustomAlert('توجه', 'دریافت داده با خطا روبرو گردید', null);
            }
        },
        error: function () {
            CustomAlert('توجه', 'دریافت داده با خطا روبرو گردید', null);
            errorCallback();

        },
        async: true
    });
}


function LoadViews() {
    Debug('Loading Views');
    $("#NewMemberContent").load("newMemberView.html");
    $("#SuggestionContent").load("suggestionView.html");
    $("#ListOfRolesContent").load("listOfRolesView.html");
    $("#ForgotPasswordContent").load("forgotPasswordView.html");
    $("#NewChildContent").load("newChildView.html");
    $("#NewPaymentContent").load("newPaymentView.html");
    $("#NewHamsarContent").load("newHamsarView.html");
    $("#NewCausinContent").load("newCausinView.html");
    $("#ListOfMembersContent").load("listOfMembersView.html");
    $("#NewProjectContent").load("newProjectView.html");
    $("#MemberInfoContent").load("memberDetailsView.html", function () {
        $("#tabs").tabs();
    });
}



function PrepareMemberInfo() {
    ClearRelationalTable();
    $('#MemberInfoImageInput').fileupload({
        dataType: 'json',
        url: ServerURL + 'Account/UploadPicture',
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
            temporalPictureName = data.result.Name;
        }
    });

    $("#MemberInfoJob2").hide();
    $("div[name=OtherJobs]").hide();

    $("#MemberInfoJob1Concept").change(function () {
        if ($("#MemberInfoJob1Concept").val() == 1) {
            $("#MemberInfoJob2").show();
            $("div[name=OtherJobs]").hide();
        } else if ($("#MemberInfoJob1Concept").val() == 2) {
            $("#MemberInfoJob2").hide();
            $("div[name=OtherJobs]").hide();
            $("#MemberInfoJob4").show();
        } else {
            $("#MemberInfoJob2").hide();
            $("div[name=OtherJobs]").hide();
        }
    });

    $("#MemberInfoOtherType").change(function () {
        if ($("#MemberInfoOtherType").val() == 1) {
            $("#MemberInfoJob5").show();
            $("#MemberInfoJob6").hide();
        } else if ($("#MemberInfoOtherType").val() == 2) {
            $("#MemberInfoJob5").hide();
            $("#MemberInfoJob6").show();
        } else {
            $("#MemberInfoJob5").hide();
            $("#emberInfoJob6").hide();
        }
    });
}

function PrepareNewMember() {
    ClearRelationalTable();
    ClearForm();
    $('#NewMemberImageInput').fileupload({
        dataType: 'json',
        url: ServerURL + 'Account/UploadPicture',
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
            temporalPictureName = data.result.Name;
        }
    });

    $("#NewMemberJob2").hide();
    $("div[name=OtherJobs]").hide();

    $("#NewMemberJob1Concept").change(function () {
        if ($("#NewMemberJob1Concept").val() == 1) {
            $("#NewMemberJob2").show();
            $("div[name=OtherJobs]").hide();


        } else if ($("#NewMemberJob1Concept").val() == 2) {
            $("#NewMemberJob2").hide();
            $("div[name=OtherJobs]").hide();
            $("#NewMemberJob4").show();
        } else {
            $("#NewMemberJob2").hide();
            $("div[name=OtherJobs]").hide();
        }
    });

    $("#NewMemberOtherType").change(function () {
        if ($("#NewMemberOtherType").val() == 1) {
            $("#NewMemberJob5").show();
            $("#NewMemberJob6").hide();
        } else if ($("#NewMemberOtherType").val() == 2) {
            $("#NewMemberJob5").hide();
            $("#NewMemberJob6").show();
        } else {
            $("#NewMemberJob5").hide();
            $("#NewMemberJob6").hide();
        }
    });


    $("div[name=NewMemberIsargari]").hide();
    $("#NewMemberIsargariType").change(function () {
        $("div[name=NewMemberIsargari]").hide();
        if ($("#NewMemberIsargariType").val() == 1) {
            $("#NewMemberIsargariAzade").show();
        } else if ($("#NewMemberIsargariType").val() == 2) {
            $("#NewMemberIsargariJanbaz").show();
        } else if ($("#NewMemberIsargariType").val() == 3) {
            $("#NewMemberIsargariRazmande").show();

        } else if ($("#NewMemberIsargariType").val() == 4) {
            $("#NewMemberIsargariIsargarFamily").show();

        }
    });
    GotoWizard(1);
}

function IsUserExist(nationalityCode, trueCallback, falseCallback, errorCallback) {
    CustomBlockingPanel('توجه', 'در حال برسی کد ملی ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/IsExistUser",
        dataType: 'json',
        data: {
            nationalityCode: nationalityCode
        },
        success: function (result) {
            if (result.Status == true) {
                if (result.Message == 2) {
                    CustomAlert('توجه', "کد ملی وجود دارد", null);
                    trueCallback();
                } else {
                    CustomAlert('توجه', "این کد ملی وجود ندارد و شما می توانید ادامه دهید.", null);
                    falseCallback();
                }
            } else {
                CustomAlert('توجه', 'دریافت داده با خطا روبرو گردید', null);
                errorCallback();
            }
        },
        error: function () {
            CustomAlert('توجه', 'دریافت داده با خطا روبرو گردید', null);
            errorCallback();

        },
        async: true
    });
}

function AddNewMember() {
    var newMember = {
        ProfileFirstName: $("#ProfileFirstName").val(),
        ProfileLastName: $("#ProfileLastName").val(),
        ProfileGender: $("#ProfileGender").val(),
        ProfileDegree: $("#ProfileDegree").val(),
        ProfileNationalityCode: $("#ProfileNationalityCode").val(),
        ProfileShenasnameCode: $("#ProfileShenasnameCode").val(),
        ProfileShenasnamePlace: $("#ProfileShenasnamePlace").val(),
        ProfilePersonID: $("#ProfilePersonID").val(),
        ProfileBirthdateDay: $("#ProfileBirthdateDay").val(),
        ProfileBirthdateMonth: $("#ProfileBirthdateMonth").val(),
        ProfileBirthdateYear: $("#ProfileBirthdateYear").val(),
        ProfileMobile: $("#ProfileMobile").val(),
        ProfileHomePhone: $("#ProfileHomePhone").val(),
        ProfileWorkPhone: $("#ProfileWorkPhone").val(),
        ProfileEmail: $("#ProfileEmail").val(),
        ProfileCity: $("#ProfileCity").val(),
        NewMemberEmployeeDateDay: $("#NewMemberEmployeeDateDay").val(),
        NewMemberEmployeeDateYear: $("#NewMemberEmployeeDateYear").val(),
        NewMemberEmployeeDateMonth: $("#NewMemberEmployeeDateMonth").val(),
        NewMemberContractType: $("#NewMemberJob3ContractType").val(),
        NewMemberJobType: $("#NewMemberJob3Types").val(),
        NewMemberJobConcept: $("#NewMemberJob1Concept").val(),
        NewMemberJobStatus: $("#NewMemberJobStatus").val(),
        NewMemberJobName: $("#NewMemberJobName").val(),
        NewMemberJobPlace: $("#NewMemberJobPlace").val(),
        NewMemberOthertype: $("#NewMemberOtherType").val(),
        NewMemberJob3University: $("#NewMemberJob3University").val(),
        NewMemberIsAzadeh: $("#NewMemberIsAzadeh").is(":checked"),
        NewMemberIsJanbaz: $("#NewMemberIsJanbaz").is(":checked"),
        NewMemberIsRazmande: $("#NewMemberIsRazmande").is(":checked"),
        NewMemberIsIsargar: $("#NewMemberIsIsargar").is(":checked"),
        NewMemberIsFamilyOfShahid: $("#NewMemberIsFamilyOfShahid").is(":checked"),
        NewMemberIsChildOfShahid: $("#NewMemberIsChildOfShahid").is(":checked"),
        NewMemberEsratDuration: $("#NewMemberEsratDuration").val(),
        NewMemberJanbaziPercent: $("#NewMemberJanbaziPercent").val(),
        NewMemberJebheDuration: $("#NewMemberJebheDuration").val(),
        NewMemberIsargariIsargarFamilyType: $("#NewMemberIsargariIsargarFamilyType").val(),
        NewMemberPictureName: temporalPictureName
    }
    Debug(newMember);

    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/AddNewMember",
        dataType: 'json',
        data: newMember,
        success: function (result) {
            if (result.Status == true) {
                var nationalityCode = newMember.ProfileNationalityCode;
                for (var i = 0; i < listOfChildrens.length; i++) {
                    listOfChildrens[i].userName = nationalityCode;
                    $.ajax({
                        type: 'POST',
                        url: ServerURL + "Account/AddChild",
                        dataType: 'json',
                        data: listOfChildrens[i],
                        async: false
                    });
                }
                for (var i = 0; i < listOfMates.length; i++) {
                    listOfMates[i].userName = nationalityCode;
                    $.ajax({
                        type: 'POST',
                        url: ServerURL + "Account/AddHamsar",
                        dataType: 'json',
                        data: listOfMates[i],
                        async: false
                    });
                }
                for (var i = 0; i < listOfEtc.length; i++) {
                    listOfEtc[i].userName = nationalityCode;
                    $.ajax({
                        type: 'POST',
                        url: ServerURL + "Account/AddCausin",
                        dataType: 'json',
                        data: listOfEtc[i],
                        async: false
                    });
                }
                GotoWizard(8);
            } else {
                GotoWizard(9);
            }
            Debug(result.Message);
        },
        error: function () {
            GotoWizard(9);
        },
        async: true
    });
}

function ClearForm() {
    $("#NewMemberTakafolEtc tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    $("#NewMemberHamsars tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    $("#NewMemberChilds tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    $("#ProfileFirstName").val("");
    $("#ProfileLastName").val("");
    $("#ProfileNationalityCode").val("");
    $("#ProfileShenasnameCode").val("");
    $("#ProfileShenasnamePlace").val("");
    $("#ProfilePersonID").val("");
    $("#ProfileMobile").val("");
    $("#ProfileHomePhone").val("");
    $("#ProfileWorkPhone").val("");
    $("#ProfileEmail").val("");
    $("#NewMemberJobName").val("");
    $("#NewMemberJobPlace").val("");
    $("#NewMemberIsAzadeh").prop("checked", false);
    $("#NewMemberIsJanbaz").prop("checked", false);
    $("#NewMemberIsRazmande").prop("checked", false);
    $("#NewMemberIsIsargar").prop("checked", false);
    $("#NewMemberIsFamilyOfShahid").prop("checked", false);
    $("#NewMemberIsChildOfShahid").prop("checked", false);
    $("#NewMemberEsratDuration").val("");
    $("#NewMemberJanbaziPercent").val("");
    $("#NewMemberJebheDuration").val("");
}


function DetectLoggedInUser() {
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/IsLoggedIn",
        dataType: 'json',
        success: function (result) {
            if (result.Status == false) {
                window.location = BaseURL + "/html/login.html";
            } else {
                Membership = result.Result;
                $("#UserName").html(Membership.UserName);
            }
        },
        async: true
    });
}

function GetPrsianDate(currentDate) {
    var _splitedDate = currentDate.split(":");
    var _month = _splitedDate[1];
    switch (_month) {
        case "1":
            _month = "فروردین";
            break;
        case "2":
            _month = "اردیبهشت";
            break;
        case "3":
            _month = "خرداد";
            break;
        case "4":
            _month = "تیر";
            break;
        case "5":
            _month = "مرداد";
            break;
        case "6":
            _month = "شهریور";
            break;
        case "7":
            _month = "مهر";
            break;
        case "8":
            _month = "آبان";
            break;
        case "9":
            _month = "آذر";
            break;
        case "10":
            _month = "دی";
            break;
        case "11":
            _month = "بهمن";
            break;
        case "12":
            _month = "اسفند";
            break;
    }
    var _msg;
    if (_splitedDate[3] != "") {
        _msg = "ساعت " + _splitedDate[3] + " ، " + _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    } else {
        _msg = _splitedDate[2] + "  " + _month + "  ماه سال" + _splitedDate[0];
    }
    return _msg;
}

function CustomAlert(title, message, callback) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomMessageBoxLoadingPanel").hide();
    $("#CustomConfirmWindow").hide();
    $("#CustomAlertWindow").show();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    $('#CustomMessageBoxButton').click(function () {
        messageBox.hide();
        if (callback != null) {
            callback();
        }
        $('#CustomMessageBoxButton').unbind();
    });
}

function CustomBlockingPanel(title, message, timeout, callback) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomConfirmWindow").hide();
    $("#CustomAlertWindow").hide();
    $("#CustomMessageBoxLoadingPanel").show();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    if (timeout != -1) {
        setTimeout(function () {
            if (callback != null) {
                callback();
            }
            messageBox.hide();
        }, timeout);
    }
}

function RemoveUserFromRole(userName, roleName) {
    Debug("Todo");
}


function ViewUserRoles(userName) {

    $("#ListOfUserRolesTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    $("#ListOfUserRolesTopic").html("فهرست نقش های  " + userName);
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);

    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetRolesForUser",
        data: {
            userName: userName
        },
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 500, null);
            if (result.Status == true) {
                var newRow = "";
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += '<td><center>' + result.Result[i] + '</center></td>';

                    newRow += '<td style="width:100px;"><center>' + '<div title="حذف نقش" data-rel="tooltip"  class="btn btn-warning" onclick="RemoveUserFromRole(' + "'" + userName + "','" + result.Result[i] + "'" + ');">حذف نقش</div>' + '</center></td>';
                    newRow += '<td style="width:100px;"><center>' + '<div title="مشاهده دیگر اعضا" data-rel="tooltip"  class="btn btn-success" onclick="ViewUserInRoles(' + "'" + result.Result[i] + "'" + ');">مشاهده دیگر اعضا</div>' + '</center></td>';
                    newRow += "</tr>";
                    Debug(newRow);
                    $('#ListOfUserRolesTable').append(newRow);
                }

                ShowBox("#ListOfUserRoles");
            } else { }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'خطای دسترسی', 1000, null);
        },
        async: true
    });

}


function ReCalculateRanking() {
    console.log("ReCalculateRanking");
    var reordered = $org.context.Members.orderBy(function (item) { return item.Point; }).toArray(function (result) {
        for (var i = 0; i < result.length; i++) {
            var it = result[i];
            $org.context.Members.attach(it);
            it.Rank = result.length - i;
            console.log("New rank for : " + it.Rank + " : " + it.NationalityCode);
            $org.context.saveChanges();
        }
    });
}

var RefreshMemberIns;
function RefreshMember(memberId) {
    console.log("RefreshMember : " + memberId);
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetMember",
        dataType: 'json',
        data: { userName: memberId },
        success: function (result) {

            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 500, null);
            if (result.Status == true) {
                RefreshMemberIns = new $org.types.Member();
                RefreshMemberIns.FirstName = result.Result.FirstName;
                RefreshMemberIns.NationalityCode = result.Result.NationalityCode;
                console.log("Nationality id : " + result.Result.NationalityCode);
                RefreshMemberIns.LastName = result.Result.LastName;
                RefreshMemberIns.IsApproved = result.Result.IsApproved;
                RefreshMemberIns.Point = result.Result.Point;
                RefreshMemberIns.CreateDate = result.Result.Date;
                RefreshMemberIns.Payment = result.Result.TotalPayment;
                var selected;
                $org.context.Members.forEach(function (item) {
                    if (item.NationalityCode == memberId) {
                        selected = item;
                        RefreshMemberIns.Rank = selected.Rank;
                        console.log("Update : " + item.NationalityCode + ":" + memberId);
                        console.log("Update : " + item);
                        console.log("Update : " + result.Result);
                    }
                }).then(function () {
                    console.log("Update fields");
                    $org.context.Members.remove(selected);
                    console.log("Add Member");
                    console.log(RefreshMemberIns);
                    $org.context.Members.add(RefreshMemberIns);
                    $org.context.saveChanges().then(function () {
                        console.log("done!");
                        //ReCalculateRanking();
                        GetListOfMembers();

                        console.log("Point updated to : " + RefreshMemberIns.Point);
                    });
                });
            } else {

            }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'خطای دسترسی', 1000, null);
        },
        async: true
    });
}

function FetchListOfMembersFromServer() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfMembers",
        dataType: 'json',
        success: function (result) {

            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 500, null);
            if (result.Status == true) {
                $org.context.Members.forEach(function (item) {
                    $org.context.Members.remove(item);
                }).then(function () {
                    $org.context.saveChanges().then(function () { console.log("Members Data Clean successfully"); });
                    members = [];
                    for (var i = 0; i < result.Result.length; i++) {
                        var res = {
                            NationalityId: result.Result[i].UserName,
                            FirstName: result.Result[i].FirstName,
                            LastName: result.Result[i].LastName,
                            Date: result.Result[i].Date,
                            IsApproved: result.Result[i].IsApproved,
                            Point: result.Result[i].Point,
                            NationalityCode: result.Result[i].UserName,
                            Rank: result.Result[i].Rank,
                            Payment: result.Result[i].TotalPayment
                        };
                        console.log(res);
                        members.push(res);
                        var newSample = new $org.types.Member();
                        newSample.FirstName = res.FirstName;
                        newSample.NationalityCode = res.NationalityId;
                        newSample.LastName = res.LastName;
                        newSample.IsApproved = res.IsApproved;
                        newSample.Point = res.Point;
                        newSample.CreateDate = res.Date;
                        newSample.Rank = res.Rank;
                        newSample.Payment = res.Payment;
                        $org.context.Members.add(newSample);
                        //$org.context.Members.removeAll();
                        //console.log(newSample);
                        //console.log("Add to database successfully");
                    }
                    $org.context.saveChanges().then(function () { console.log("done!"); });
                    GetListOfMembers();
                });

            } else {

            }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'خطای دسترسی', 1000, null);
        },
        async: true
    });
}

function GetListOfMembers() {

    DataTableify();

    $("#ListOfMembersTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    var results = new Array();
    console.log("###########################################");
    //var members2 = $org.context.Members.toArray();
    $org.context.Members.forEach(function (user) {
        var res = [
            user.NationalityCode,
            user.FirstName,
            user.LastName,
            user.CreateDate,
            user.IsApproved,
            user.Point,
			user.Rank,
            remaskPayment(user.Payment),
            user.NationalityCode
	        ];
        console.log("###########################################");
        console.log("Element : " + user);
        console.log("New Record : " + res);
        results.push(res);
    }).then(function () {
        Debug("%%%%%%%%%%%%%%%%%%%%%%%%%%");

        jQuery.fn.dataTableExt.oSort["payment-desc"] = function (x, y) {

            function removeComma(str) {
                var replaced = "";
                for (var i = 0; i < str.length; i++)
                    if (str[i] != ',')
                        replaced += str[i];
                console.log(str + ":" + replaced);
                return parseInt(replaced);
            };
            return removeComma(x) - removeComma(y);
        };

        jQuery.fn.dataTableExt.oSort["payment-asc"] = function (x, y) {
            return jQuery.fn.dataTableExt.oSort["payment-desc"](y, x);
        }

        oTable = $('#ListOfMembersTable').dataTable({
            "bDestroy": true,
            "bJQueryUI": true,
            "bProcessing": true,
            "bDeferRender": true,
            "oLanguage": {
                "sProcessing": "درحال پردازش...",
                "sLengthMenu": "نمایش محتویات _MENU_",
                "sZeroRecords": "موردی یافت نشد",
                "sInfo": "نمایش _START_ تا _END_ از مجموع _TOTAL_ مورد",
                "sInfoEmpty": "تهی",
                "sInfoFiltered": "(فیلتر شده از مجموع _MAX_ مورد)",
                "sInfoPostFix": "",
                "sSearch": "جستجو:",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "ابتدا",
                    "sPrevious": "قبلی",
                    "sNext": "بعدی",
                    "sLast": "انتها"
                }
            },
            "aaData": results,
            "aoColumns": [
		{
		    "sTitle": "کد ملی"
		},
		{
		    "sTitle": "نام"
		},
		{
		    "sTitle": "نام خانوادگی"
		},
		{
		    "sTitle": "تاریخ عضویت"
		},
		{
		    "sTitle": "وضعیت",
		    "fnRender": function (obj) {
		        var sReturn = obj.aData[obj.iDataColumn];
		        Debug(sReturn);
		        if (sReturn == true) {
		            sReturn = '<center><div class="label label-success">تایید شده</div></center>';
		        } else
		            sReturn = '<center><div class="label label-error">تایید نشده</div></center>';
		        return sReturn;
		    }
		},
		{
		    "sTitle": "امتیاز"
		},
		{
		    "sTitle": "رتبه"
		},
        {
            "sTitle": "مبلغ پرداختی",
            "bSortable": true,
            "sType": "payment"
        },
		{
		    "sTitle": "",
		    "fnRender": function (obj) {
		        var sReturn = obj.aData[obj.iDataColumn];
		        sReturn = '<table><tr>' + '<td><div title="جزییات" data-rel="tooltip"  class="btn btn-info" onclick="ShowDetails(' + "'" + sReturn + "'" + ');">جزئیات</div></td><td><div title="بروزرسانی" data-rel="tooltip"  class="btn btn-success" onclick="selectedRow = $(this).parent().parent(); RefreshMember(' + "'" + sReturn + "'" + ');">بروزرسانی</div></td>' + '</tr></table>';
		        return sReturn;
		    }
		}]
        });

        ShowBox("#ListOfMembers");
    });

    /*var index = 0 ;
    console.log(members2.length);
    for(index = 0 ;  index < members2.length ; index ++)
    {
    var user = members2[index];
    var res = [
    user.NationalityCode,
    user.FirstName,
    user.LastName,
    user.CreateDate,
    user.IsApproved,
    user.Point,
    user.NationalityCode
    ];
    results.push(res);
    };
    Debug(results);*/

}

function ShowDetails(nationalityCode) {
    PrepareMemberInfo();
    LoadUserDetails(nationalityCode);
    ShowBox("#MemberInfo");
}

function ViewUserInRoles(roleName) {

    $("#ListOfUserInRolesTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    $("#ListOfUsersInRolesTopic").html("فهرست اعضای با نقش " + roleName);

    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserInRoles",
        dataType: 'json',
        data: {
            roleName: roleName
        },
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 500, null);
            if (result.Status == true) {
                var newRow = "";
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += '<td><center>' + result.Result[i] + '</center></td>';
                    newRow += '<td style="width:100px;"><center>' + '<div title="مشاهده دیگر نقشها" data-rel="tooltip"  class="btn btn-success" onclick="ViewUserRoles(' + "'" + result.Result[i] + "'" + ');">مشاهده نقشها</div>' + '</center></td>';
                    newRow += '<td style="width:100px;"><center>' + '<div title="حذف نقش" data-rel="tooltip"  class="btn btn-warning" onclick="RemoveUserFromRole(' + "'" + result.Result[i] + "','" + roleName + "'" + ');">حذف نقش</div>' + '</center></td>';
                    newRow += "</tr>";
                    Debug(newRow);
                    $('#ListOfUserInRolesTable').append(newRow);
                }

                ShowBox("#ListOfUsersInRoles");
            } else {
                Debug(result.Message);
            }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'خطای دسترسی', 1000, null);
        },
        async: true
    });
}

function GetListOfRoles() {
    $("#ListOfRolesTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfRoles",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);

            if (result.Status == true) {
                var newRow = "";
                for (var i = 0; i < result.Result.length; i++) {
                    var newRow = "<tr>";
                    newRow += '<td><center>' + result.Result[i] + '</center></td>';
                    newRow += '<td style="width:100px;"><center>' + '<div title="مشاهده اعضا" data-rel="tooltip"  class="btn btn-success" onclick="ViewUserInRoles(' + "'" + result.Result[i] + "'" + ');">مشاهده اعضا</div>' + '</center></td>';
                    newRow += "</tr>";
                    Debug(newRow);
                    $('#ListOfRolesTable').append(newRow);
                }

                ShowBox("#ListOfRoles");
            } else {
                //	Debug(result.Message);
            }
        },
        error: function () {
            CustomBlockingPanel('توجه', 'خطای دسترسی', 1000, null);
        },
        async: true
    });
}

function CustomConfirm(title, message, callbackYes, callbackNo) {
    var messageBox = $("#CustomMessageBox");
    var messageText = $("#CustomMessageText");
    var messsageTitle = $("#CustomMessageTitle");
    $("#CustomConfirmWindow").show();
    $("#CustomAlertWindow").hide();
    $("#CustomMessageBoxLoadingPanel").hide();
    messageText.html(message);
    messsageTitle.html(title);
    messageBox.show();
    $('#CustomConfirmWindowYes').click(function () {
        messageBox.hide();
        if (callbackYes != null) {
            callbackYes();
        }
        $('#CustomConfirmWindowYes').unbind();
    });
    $('#CustomConfirmWindowNo').click(function () {
        messageBox.hide();
        if (callbackNo != null) {
            callbackNo();
        }
        $('#CustomConfirmWindowNo').unbind();
    });
}

function Debug(dbg) {
    console.log(dbg);
}

function ShowControlPanel(isControlPanel) {
    if (isControlPanel == true) {
        $("#SeminarMode").hide();
        $("#ControlPanelMode").show();
    } else {
        $("#SeminarMode").show();
        $("#ControlPanelMode").hide();

    }
}

function SendRecom() {
    if (!(userName == null || userName == "")) {
        var _message = $("#PishnahadatPanel").val();
        if (_message != "") {
            content = {
                userName: userName,
                message: _message
            };
            $.ajax({
                type: 'POST',
                url: ServerURL + "Account/SendAdvice",
                dataType: 'Json',

                success: function (result) {

                    if (result.Status == true) {
                        alert("نظر شما ثبت گردید. با تشکر");
                        $("#Pishnahadat").hide();
                    } else {
                        alert("مجددا تلاش نمایید.");
                    }
                },
                data: content,
                async: true
            });
        }
    } else {
        alert("not signed in");
    }
}

function LogoutFromServer() {
    $.getJSON(ServerURL + "Account/LogOutOfServer", {}, function (result) {
        window.location = "http://taavoniut3.ir/Public/index.htm";
    });
}

function GetUserProfile() {
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetProfile",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'اطلاعات دریافت شد', 1000, null);
            if (result.Status == true) {
                $("#ProfileFirstName").val(result.Result.firstName);
                $("#ProfileLastName").val(result.Result.lastName);
                //$("#ProfileInterNationalID").val(result.Result.nationId);
                $("#ProfileEmail").val(result.Result.email);
                $("#ProfileMobile").val(result.Result.mobile);

                var gender;
                if (result.Result.gender == true) {
                    gender = 0;
                } else {
                    gender = 1;
                }
                $("#ProfileSelectCity option:selected").attr("selected", false);
                $("#ProfileSelectCity" + result.Result.city).attr("selected", true);
                $("#ProfileselectGender option:selected").attr("selected", false);
                $("#ProfileselectGender" + gender).attr("selected", true);
                $("#ProfileSelectDegree option:selected").attr("selected", false);
                $("#ProfileSelectDegree" + result.Result.degree).attr("selected", true);
                $("#ProfileBirthdateYear option:selected").attr("selected", false);
                $("#ProfileBirthdateMonth option:selected").attr("selected", false);
                $("#ProfileBirthdateDay option:selected").attr("selected", false);
                if (result.Result.photo != null && result.Result.photo != "") {
                    document.getElementById('ProfileImageImage').src = "http://iwebinar.ir/Pics/Users/Originals/" + userName + ".png";
                }
                var splitedDate = result.Result.birthday.split(":");
                $("#ProfileBirthdateYear option[value=" + splitedDate[0] + "]").attr("selected", true);
                $("#ProfileBirthdateMonth option[value=" + splitedDate[1] + "]").attr("selected", true);
                $("#ProfileBirthdateDay option[value=" + splitedDate[2] + "]").attr("selected", true);
                IsFirstLogIn = false;
            } else {
                IsFirstLogIn = true;
            }
        },
        data: {
            username: userName
        },
        async: false
    });
}

function CloseAllForm() {
    $("div[name=PanelWindow]").hide();
}

function ShowNewAlbumForm() {
    $('#NewAlbum').modal('show');
}

function ClearAlbumForm() {
    $("#AlbumName").val("");
    $("#AlbumDesc").val("");
}

function LoadAlbums(){
	    $("#AlbumListTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

     CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور', -1, null);
     $.ajax({
         type: 'GET',
         url: ServerURL + "Account/getListOfAlbums",
         dataType: 'json',
         success: function (result) {
             if (result.Status == true) {
                 CustomBlockingPanel('توجه', 'اطلاعات با موفقیت دریافت گردید.', 500, null);
                 console.log(result);
                 for (var i = 0; i < result.Result.length; i++) {
                     var row = "<tr>";
                     row += "<td>" + result.Result[i].Id + "</td>";
                     row += "<td>" + result.Result[i].Name + "</td>";
                     row += "<td>" + result.Result[i].State + "</td>";
                     row += "<td>" + result.Result[i].Explanation + "</td>";
                     row += '<td><button name="Album" style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeleteAlbum(' + "'" + result.Result[i].Id + "'" + ');"> حذف </button>';
                     row += '<button name="Album"  style="width:100%" class="btn btn-large btn-info" onclick="ImagesForAlbum(' + "'" + result.Result[i].Id + "'" + ');"> تصاویر </button>' +
                         '' + '<button name="Album" style="width:100%" class="btn btn-large btns" onclick="albumDialogType = 2; EditAlbum(' + "'" + result.Result[i].Id + "'," + "'" + result.Result[i].Name + "'," + "'" + result.Result[i].Explanation + "'"  + ');"> ویرایش </button>'+
                         '</td></tr>';
                     Debug(row);
                     $("#AlbumListTable").append(row);
                 }
             }
             else {
                 CustomBlockingPanel('خطا', result.Message, 500, null);
                 Debug(result.Message);
             }
         },
         error: function () { },
         async: true
     });

}


var editableAlbumId ;
function EditAlbum(albumId, albumName, albumDesc){
    editableAlbumId = albumId;
    $("#AlbumName").val(albumName);
    $("#AlbumDesc").val(albumDesc);
    $('#NewAlbum').modal('show');
}

function doEditAllbum(){
    var albumName = $("#AlbumName").val();
    var albumDesc = $("#AlbumDesc").val();
    console.log(albumName + " : " + albumDesc);
    if (albumName == "") {
        alert("لطفا نام آلبوم را وارد کنید.");
    }
    else if (albumDesc == "") {
        alert("توصیف آلبوم را وارد کنید.");
    }
    else {
        console.log("Send edit album data to server");
        CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/EditAlbum",
            data: {
                albumName: albumName,
                albumDesc: albumDesc,
                albumId : editableAlbumId
            },
            dataType: 'json',
            success: function (result) {
                if (result.Status == true) {
                    CustomBlockingPanel('توجه', 'آلبوم با موفقیت ایجاد گردید.', 500, null);
                    console.log(result);
                    LoadAlbums();
                    ClearAlbumForm();
                }
                else {
                    CustomBlockingPanel('خطا', result.Message, 500, null);
                    Debug(result.Message);
                }
            },
            error: function () { },
            async: true
        });
    }
}

function AddNewAlbum() {
    var albumName = $("#AlbumName").val();
    var albumDesc = $("#AlbumDesc").val();
    console.log(albumName + " : " + albumDesc);
    if (albumName == "") {
        alert("لطفا نام آلبوم را وارد کنید.");
    }
    else if (albumDesc == "") {
        alert("توصیف آلبوم را وارد کنید.");
    }
    else {
        console.log("Send new album data to server");
        CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/CreateNewAlbum",
            data: {
                albumName: albumName,
                albumDesc: albumDesc
            },
            dataType: 'json',
            success: function (result) {
                if (result.Status == true) {
                    CustomBlockingPanel('توجه', 'آلبوم با موفقیت ایجاد گردید.', 500, null);
                    console.log(result);
                    var row = "<tr>";
                    row += "<td>" + result.Result.Id + "</td>";
                    row += "<td>" + result.Result.Name + "</td>";
                    row += "<td>" + result.Result.State + "</td>";
                    row += "<td>" + result.Result.Explanation + "</td>";
                    row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeleteAlbum(' + "'" + result.Id + "'" + ');"> حذف </button>';
                    row += '<button  style="width:100%" class="btn btn-large btn-info" onclick="ImagesForAlbum(' + "'" + result.Id + "'" + ');"> تصاویر </button></td></tr>';
                    Debug(row);
                    selectedTable.append(row);
                    $('#NewAlbum').modal('hide');
                    LoadAlbums();
                    ClearAlbumForm();
                }
                else {
                    CustomBlockingPanel('خطا', result.Message, 500, null);
                    Debug(result.Message);
                }
            },
            error: function () { },
            async: true
        });
    }
}

function DeleteAlbum(aId){
     CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
    $.ajax({
         type: 'GET',
         url: ServerURL + "Account/DeleteAlbum",
         data : {albumId: aId},
         dataType: 'json',
         success: function (result) {
             if (result.Status == true) {
                 CustomBlockingPanel('توجه', 'اطلاعات با موفقیت دریافت گردید.', 500, null);
             }
             else {
                 CustomBlockingPanel('خطا', result.Message, 500, null);
                 Debug(result.Message);
             }
         },
         error: function () { },
         async: true
     });
}



function ImagesForAlbum(aId){
    albumId = aId;
    ShowBox("#AlbumImageList");
    LoadImageForAlbum(aId);
}

function LoadImageForAlbum(aId){
      $("#ImageListTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

     CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات از سرور', -1, null);
     $.ajax({
         type: 'GET',
         url: ServerURL + "Account/getListOfImages",
         data : {albumId: aId},
         dataType: 'json',
         success: function (result) {
             if (result.Status == true) {
                 CustomBlockingPanel('توجه', 'اطلاعات با موفقیت دریافت گردید.', 500, null);
                 console.log(result);
                 for (var i = 0; i < result.Result.length; i++) {
                     var row = "<tr>";
                     row += "<td>" + result.Result[i].Id + "</td>";
                     row += "<td>" + result.Result[i].Desc + "</td>";
                     row += "<td>" + result.Result[i].State + "</td>";
                     row += "<td>" + '<img style="width:100px; height:100px" src="http://taavoniut3.ir/ServerSide/TavooniUT3/TavooniUT3/Pics/Albums/Thumbnails/' + result.Result[i].Path +'" />'+ "</td>";
                     row += '<td><button nme="Album" style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeleteAlbumImage(' + "'" + result.Result[i].Id + "'" + ');"> حذف </button>';
                     row += '</td></tr>';
                     Debug(row);
                     $("#ImageListTable").append(row);
                 }
             }
             else {
                 CustomBlockingPanel('خطا', result.Message, 500, null);
                 Debug(result.Message);
             }
         },
         error: function () { },
         async: true
     });
}

function DeleteAlbumImage(iId){
    $.ajax({
         type: 'GET',
         url: ServerURL + "Account/DeleteImage",
         data : {imageId: iId},
         dataType: 'json',
         success: function (result) {
             if (result.Status == true) {
                 CustomBlockingPanel('توجه', 'اطلاعات با موفقیت دریافت گردید.', 500, null);
             }
             else {
                 CustomBlockingPanel('خطا', result.Message, 500, null);
                 Debug(result.Message);
             }
         },
         error: function () { },
         async: true
     });  
}

function EditAlbums() {
    ShowBox("#AlbumList");
    LoadAlbums();
}


var albumId;
function PrepareImageUploadForAlbum(){
    $('#NewAlbumImageImageInput').fileupload({
        dataType: 'json',
        url: ServerURL + 'Account/AddPictureToAlbum',
        formData: { albumId: albumId, desc: $("#AlbumImageDesc").val() },
        progressall: function (e, data) {
            var per = parseInt(data.loaded / data.total * 100, 10);
        },
        done: function (e, data) {
            CustomBlockingPanel('توجه', 'اطلاعات با موفقیت ارسال گردید.', 500, null);
            temporalPictureName = data.result.Name;
            console.log("File Uploaded successfully");
            $("#NewAlbumImage").modal('hide');
            LoadImageForAlbum(albumId);
        }
    });
    $('#NewAlbumImageImageInput').bind('fileuploadsubmit', function (e, data) {
        console.log("Upload image for : " + albumId);
        console.log($("#AlbumImageDesc").val());
        data.formData = {
            albumId: albumId,
            desc: $("#AlbumImageDesc").val()
        };
         CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
    });
}

function ShowNewImageAlbumForm(){
    alert("ShowNewImageAlbumForm");
    $("#NewAlbumImage").modal('show');
}

function ClearAlbumImageForm(){
    alert("ClearAlbumImageForm");
}


function ShowBox(box) {
    ApplyUserRoles();
    CloseAllForm();
    $(box).fadeIn(500);
}

function ChangePassword() {
    var _currentPassword = $("#ProfileCurrentPassword").val();
    var _newPassword = $("#ProfilePassword").val();
    var _confirmPassword = $("#ProfileConfirmPassword").val();

    var _hasError = false;
    if (_newPassword != _confirmPassword) {
        CustomAlert('توجه', "تکرار کلمه عبور با کلمه عبور وارد شده متفاوت است", null);
        _hasError = true;
    }
    if (_hasError == false && _currentPassword == "") {
        CustomAlert('توجه', "کلمه عبور فعلی را وارد نمایید", null);
        _hasError = true;
    }
    if (_hasError == false && _newPassword == "") {
        CustomAlert('توجه', "کلمه عبور جدید را وارد نمایید", null);
        _hasError = true;
    }
    if (_hasError == false && _confirmPassword == "") {
        CustomAlert('توجه', "تکرار کلمه عبور جدید را وارد نمایید", null);
        _hasError = true;
    }

    if (_hasError == false) {
        var pds = {
            oldPassword: _currentPassword,
            newPassword: _newPassword
        };
        CustomBlockingPanel('توجه', 'در حال ارسال اطلاعات به سرور', -1, null);
        $.getJSON(ServerURL + "Account/ChangePasswordBeta",
            pds, function (result) {

                if (result.Status == true) {
                    CustomAlert('توجه', "کلمه عبور شما با موفقیت تغییر گردید.", null);
                    CloseAllForm();
                } else {
                    CustomAlert('توجه', "خطا در هنکام تغییر رمز عبور", null);
                    CustomAlert('توجه', result.Message, null);
                }
            });
    }
}

function CheckStep1Values() {
    var values = {
        ProfileFirstName: $("#ProfileFirstName").val(),
        ProfileLastName: $("#ProfileLastName").val(),
        ProfileGender: $("#ProfileGender").val(),
        ProfileDegree: $("#ProfileDegree").val(),
        ProfileNationalityCode: $("#ProfileNationalityCode").val(),
        ProfileShenasnameCode: $("#ProfileShenasnameCode").val(),
        ProfileShenasnamePlace: $("#ProfileShenasnamePlace").val(),
        ProfilePersonID: $("#ProfilePersonID").val()
    };

    if (values.ProfileFirstName == "") {
        CustomAlert('توجه', " نام عضو جدید را وارد نمایید.", null);
        return false;
    }
    if (values.ProfileLastName == "") {
        CustomAlert('توجه', " نام خانوادگی عضو جدید را وارد نمایید.", null);
        return false;
    }
    if (values.ProfileGender == 0) {
        CustomAlert('توجه', "جنسیت عضو جدید را انتخاب نمایید.", null);
        return false;
    }
    if (values.ProfileDegree == 0) {
        CustomAlert('توجه', "مدرک تحصیلی عضو جدید را انتخاب نمایید.", null);
        return false;
    }
    if (values.ProfileNationalityCode == "") {
        CustomAlert('توجه', "کد ملی عضو جدید را وارد نمایید.", null);
        return false;
    }
    if (values.ProfileShenasnameCode == "") {
        CustomAlert('توجه', "شماره شناسنامه عضو جدید را وارد نمایید.", null);
        return false;
    }
    return true;
}


function CheckStep2Values() {
    var values = {
        ProfileMobile: $("#ProfileMobile").val(),
        ProfileHomePhone: $("#ProfileHomePhone").val(),
        ProfileWorkPhone: $("#ProfileWorkPhone").val(),
        ProfileEmail: $("#ProfileEmail").val()
    };
    if (values.ProfileMobile == "") {
        CustomAlert('توجه', "تلفن همراه عضو را وارد نمایید", null);
        return false;
    }
    if (values.ProfileHomePhone == "") {
        CustomAlert('توجه', "شماره منزل عضو را وارد نمایید.", null);
        return false;
    }
    if (values.ProfileWorkPhone == "") {
        CustomAlert('توجه', "شماره تلفن محل کار عضو را وارد نمایید", null);
        return false;
    }
    if (values.ProfileEmail == "") {
        CustomAlert('توجه', "پست الکترونیکی عضو را وارد نمایید", null);
        return false;
    }
}

function GotoWizard(step) {
    var _hasError = false;
    var _doOrdinary = true;


    if (currentStep < step) {
        if (step == 2) {
            _doOrdinary = false;
            if (CheckStep1Values() == true) {
                var isExist = IsUserExist($("#ProfileNationalityCode").val(),
                    function () { },
                    function () {
                        $("div[name=memberWizard]").hide();
                        $("#NewTerminalWizard2").show();
                        currentStep = 2;
                    },
                    function () { });
            } else {
                Debug("Has Error");
            }
        } else if (step == 3) {
            if (CheckStep2Values() == false) {
                _hasError = true;
            } else {
                _hasError = false;
                currentStep = 3;
                _doOrdinary = true;
            }
        }
    }
    if (_doOrdinary == true && _hasError == false) {
        Debug("Ordinary Bihavour");
        $("div[name=memberWizard]").hide();
        $("#NewTerminalWizard" + step).show();
    }
}

function ShowNewChildForm() {
    $('#NewChild').modal('show');
}

function ShowNewHamsarForm() {
    $('#NewHamsar').modal('show');
}

function ShowNewCausinForm() {
    $('#NewCausin').modal('show');
}

function ShowNewPaymentForm() {
    console.log("Show new payment modal");
    NewPaymentMethod = 1;
    $('#NewPayment').modal('show');
}

function Eorrify(control, step) {
    var controlName = control;

    $(controlName).removeClass("control-group");
    $(controlName).addClass("control-group error CustomtextBoxError");
    setTimeout(function () {
        $(controlName).removeClass("control-group error CustomtextBoxError");
        $(controlName).addClass("control-group");
        if (step > 0) {
            Eorrify(control, step - 1);
        }
    }, 1000);
}

function SearchKeyDown(event) {
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if (keyCode == 13) {
        SearchForAccounts(1);
    }
    //	alert ("The Unicode key code is: " + keyCode);
}

function docReady() {
    //prevent # links from moving to top
    $('a[href="#"][data-top!=true]').click(function (e) {
        e.preventDefault();
    });

    //rich text editor
    $('.cleditor').cleditor();

    //datepicker
    $('.datepicker').datepicker();

    //notifications
    $('.noty').click(function (e) {
        e.preventDefault();
        var options = $.parseJSON($(this).attr('data-noty-options'));
        noty(options);
    });


    //uniform - styler for checkbox, radio and file input
    $("input:checkbox, input:radio, input:file").not('[data-no-uniform="true"],#uniform-is-ajax').uniform();

    //chosen - improves select
    $('[data-rel="chosen"],[rel="chosen"]').chosen();

    //tabs
    $('#myTab a:first').tab('show');
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    //makes elements soratble, elements that sort need to have id attribute to save the result
    $('.sortable').sortable({
        revert: true,
        cancel: '.btn,.box-content,.nav-header',
        update: function (event, ui) {
            //line below gives the ids of elements, you can make ajax call here to save it to the database
            //console.log($(this).sortable('toArray'));
        }
    });

    //slider
    $('.slider').slider({
        range: true,
        values: [10, 65]
    });

    //tooltip
    $('[rel="tooltip"],[data-rel="tooltip"]').tooltip({
        "placement": "bottom",
        delay: {
            show: 400,
            hide: 200
        }
    });

    //auto grow textarea
    $('textarea.autogrow').autogrow();

    //popover
    $('[rel="popover"],[data-rel="popover"]').popover();

    //file manager
    var elf = $('.file-manager').elfinder({
        url: 'misc/elfinder-connector/connector.php' // connector URL (REQUIRED)
    }).elfinder('instance');

    //iOS / iPhone style toggle switch
    $('.iphone-toggle').iphoneStyle();

    //star rating
    $('.raty').raty({
        score: 4 //default stars
    });

    //gallery controlls container animation
    $('ul.gallery li').hover(function () {
        $('img', this).fadeToggle(1000);
        $(this).find('.gallery-controls').remove();
        $(this).append('<div class="well gallery-controls">' + '<p><a href="#" class="gallery-edit btn"><i class="icon-edit"></i></a> <a href="#" class="gallery-delete btn"><i class="icon-remove"></i></a></p>' + '</div>');
        $(this).find('.gallery-controls').stop().animate({
            'margin-top': '-1'
        }, 400, 'easeInQuint');
    }, function () {
        $('img', this).fadeToggle(1000);
        $(this).find('.gallery-controls').stop().animate({
            'margin-top': '-30'
        }, 200, 'easeInQuint', function () {
            $(this).remove();
        });
    });


    //gallery image controls example
    //gallery delete
    $('.thumbnails').on('click', '.gallery-delete', function (e) {
        e.preventDefault();
        //get image id
        //alert($(this).parents('.thumbnail').attr('id'));
        $(this).parents('.thumbnail').fadeOut();
    });
    //gallery edit
    $('.thumbnails').on('click', '.gallery-edit', function (e) {
        e.preventDefault();
        //get image id
        //alert($(this).parents('.thumbnail').attr('id'));
    });

    //gallery colorbox
    $('.thumbnail a').colorbox({
        rel: 'thumbnail a',
        transition: "elastic",
        maxWidth: "95%",
        maxHeight: "95%"
    });

    //gallery fullscreen
    $('#toggle-fullscreen').button().click(function () {
        var button = $(this),
            root = document.documentElement;
        if (!button.hasClass('active')) {
            $('#thumbnails').addClass('modal-fullscreen');
            if (root.webkitRequestFullScreen) {
                root.webkitRequestFullScreen(
                    window.Element.ALLOW_KEYBOARD_INPUT);
            } else if (root.mozRequestFullScreen) {
                root.mozRequestFullScreen();
            }
        } else {
            $('#thumbnails').removeClass('modal-fullscreen');
            (document.webkitCancelFullScreen || document.mozCancelFullScreen || $.noop).apply(document);
        }
    });

    //tour
    if ($('.tour').length && typeof (tour) == 'undefined') {
        var tour = new Tour();
        tour.addStep({
            element: ".span10:first",
            /* html element next to which the step popover should be shown */
            placement: "top",
            title: "Custom Tour",
            /* title of the popover */
            content: "You can create tour like this. Click Next." /* content of the popover */
        });
        tour.addStep({
            element: ".theme-container",
            placement: "left",
            title: "Themes",
            content: "You change your theme from here."
        });
        tour.addStep({
            element: "ul.main-menu a:first",
            title: "Dashboard",
            content: "This is your dashboard from here you will find highlights."
        });
        tour.addStep({
            element: "#for-is-ajax",
            title: "Ajax",
            content: "You can change if pages load with Ajax or not."
        });
        tour.addStep({
            element: ".top-nav a:first",
            placement: "bottom",
            title: "Visit Site",
            content: "Visit your front end from here."
        });

        tour.restart();
    }




    $('.btn-close').click(function (e) {
        e.preventDefault();
        $(this).parent().parent().parent().fadeOut();
    });
    $('.btn-minimize').click(function (e) {
        e.preventDefault();
        var $target = $(this).parent().parent().next('.box-content');
        if ($target.is(':visible')) $('i', $(this)).removeClass('icon-chevron-up').addClass('icon-chevron-down');
        else $('i', $(this)).removeClass('icon-chevron-down').addClass('icon-chevron-up');
        $target.slideToggle();
    });
    $('.btn-setting').click(function (e) {
        e.preventDefault();
        $('#myModal').modal('show');
    });




    //initialize the external events for calender

    $('#external-events div.external-event').each(function () {

        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true, // will cause the event to go back to its
            revertDuration: 0 //  original position after the drag
        });

    });


    //initialize the calendar
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar !!!
        drop: function (date, allDay) { // this function is called when something is dropped

            // retrieve the dropped element's stored Event Object
            var originalEventObject = $(this).data('eventObject');

            // we need to copy it, so that multiple events don't have a reference to the same object
            var copiedEventObject = $.extend({}, originalEventObject);

            // assign it the date that was reported
            copiedEventObject.start = date;
            copiedEventObject.allDay = allDay;

            // render the event on the calendar
            // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
            $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
                // if so, remove the element from the "Draggable Events" list
                $(this).remove();
            }

        }
    });
}


//additional functions for data table
$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
    return {
        "iStart": oSettings._iDisplayStart,
        "iEnd": oSettings.fnDisplayEnd(),
        "iLength": oSettings._iDisplayLength,
        "iTotal": oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
    };
}
$.extend($.fn.dataTableExt.oPagination, {
    "bootstrap": {
        "fnInit": function (oSettings, nPaging, fnDraw) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function (e) {
                e.preventDefault();
                if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
                    fnDraw(oSettings);
                }
            };

            $(nPaging).addClass('pagination').append('<ul>' + '<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' + '<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' + '</ul>');
            var els = $('a', nPaging);
            $(els[0]).bind('click.DT', {
                action: "previous"
            }, fnClickHandler);
            $(els[1]).bind('click.DT', {
                action: "next"
            }, fnClickHandler);
        },

        "fnUpdate": function (oSettings, fnDraw) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

            if (oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            } else if (oPaging.iPage <= iHalf) {
                iStart = 1;
                iEnd = iListLength;
            } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }

            for (i = 0, iLen = an.length; i < iLen; i++) {
                // remove the middle elements
                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                // add the new list items and their event handlers
                for (j = iStart; j <= iEnd; j++) {
                    sClass = (j == oPaging.iPage + 1) ? 'class="active"' : '';
                    $('<li ' + sClass + '><a href="#">' + j + '</a></li>')
                        .insertBefore($('li:last', an[i])[0])
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
                            fnDraw(oSettings);
                        });
                }

                // add / remove disabled classes from the static elements
                if (oPaging.iPage === 0) {
                    $('li:first', an[i]).addClass('disabled');
                } else {
                    $('li:first', an[i]).removeClass('disabled');
                }

                if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
                    $('li:last', an[i]).addClass('disabled');
                } else {
                    $('li:last', an[i]).removeClass('disabled');
                }
            }
        }
    }
});