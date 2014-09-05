//Region : Global Variables
//Region : Functions
function Debug(message) {
    console.log(message);
}

function ShowAllChildrens()
{
	for (var i = 0; i < listOfChildrens.length; i++) {
		Debug(listOfChildrens[i]);
	}
}

function ShowAllMates()
{
	 for (var i = 0; i < listOfMates.length; i++) {
		 Debug(listOfMates[i]);
	 }
}

function ShowAllCausin()
{
	  for (var i = 0; i < listOfEtc.length; i++) {
		   Debug(listOfEtc[i]);
	  }
}

function CustomModalAlert(title, desc, callback) {
    alert(desc);
}

function RemoveRelation(userName, relationId)
{
		Debug('Remove Relation From Server');
			$.ajax({
				type: 'GET',
				url: ServerURL + "Account/DeleteRelation",
				dataType: 'json',
				data : { userName : userName, relationId : relationId },
				success: function(result){ Debug(result.Message);},
				async:true
				});
}

function DeleteChildren(internationalCode, successCallback, errorCallback) {
    for (var i = 0; i < listOfChildrens.length; i++) {
        if (listOfChildrens[i].ChildInternationalCode == internationalCode) {
            listOfChildrens.splice(i, 1);
            if (successCallback != null)
                successCallback();
			RemoveRelation(selectedMember , internationalCode);
			//DeleteRelation(string userName, string relationId)
			
			ShowAllChildrens();
            break;
        }
    }
    if (errorCallback != null)
        errorCallback();
}

function DeleteHamsar(internationalCode, successCallback, errorCallback) {
	Debug("List Of Mates : " + listOfMates.length);
    for (var i = 0; i < listOfMates.length; i++) {
        if (listOfMates[i].NewHamsarInternationalCode == internationalCode) {
            listOfMates.splice(i, 1);
            if (successCallback != null)
                successCallback();
			RemoveRelation(selectedMember , internationalCode);
			ShowAllMates();
            break;
        }
    }
    if (errorCallback != null)
        errorCallback();
}

function DeleteCausin(internationalCode, successCallback, errorCallback) {
    for (var i = 0; i < listOfEtc.length; i++) {
        if (listOfEtc[i].NewCausinInternationalCode == internationalCode) {
            listOfEtc.splice(i, 1);
            if (successCallback != null)
                successCallback();
			RemoveRelation(selectedMember , internationalCode);
			ShowAllCausin();
            break;
        }
    }
    if (errorCallback != null)
        errorCallback();
}

function ClearChildrenForm() {
    $("#ChildFirstName").val("");
    $("#ChildLastName").val("");
    $("#ChildPhone").val("");
    $("#ChildInternationalCode").val("");
}

function ClearMateForm() {
    $("#NewHamsarFirstName").val("");
    $("#NewHamsarLastName").val("");
    $("#NewHamsarInternationalCode").val("");
    $("#NewHamsarPhone").val("");
    $("#NewHamsarJob").val("");
    $("#NewHamsarJobPlace").val("");
}

function ClearCausinForm() {
    $("#NewCausinFirstName").val("");
    $("#NewCausinLastName").val("");
    $("#NewCausinRelation").val("");
    $("#NewCausinInternationalCode").val("");
    $("#NewCausinAge").val("");
}

function AddNewChildren() {
    var newChild = {
        ChildFirstName: $("#ChildFirstName").val(),
        ChildLastName: $("#ChildLastName").val(),
        ChildGenderType: $("#ChildGenderType").val(),
        ChildPhone: $("#ChildPhone").val(),
        ChildInternationalCode: $("#ChildInternationalCode").val()
    };
    var hasError = false;
    if (newChild.ChildFirstName == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا نام را وارد نمایید", null);
    } else if (newChild.ChildGenderTypec == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نوع جنسیت را وارد نمایید", null);
    } else if (newChild.ChildInternationalCode == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else if (newChild.ChildLastName == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نام خانوادگی را وارد نمایید", null);
    } else if (newChild.ChildPhone == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا شماره تماس را وارد نمایید", null);
    } else {
        for (var i = 0; i < listOfChildrens.length; i++) {
            if (listOfChildrens[i].ChildInternationalCode == newChild.ChildInternationalCode) {
                CustomModalAlert("خطا", "این کد ملی قبلا به عنوان فرزند استفاده شده است.", null);
                hasError = true;
                break;
            }
        }
    }

    if (hasError == false) {
        listOfChildrens.push(newChild);
        var index = listOfChildrens.length - 1;
        var row = "<tr>";
        row += "<td>" + newChild.ChildFirstName + "</td>";
        row += "<td>" + newChild.ChildLastName + "</td>";
        row += "<td>" + newChild.ChildInternationalCode + "</td>";
        row += "<td>" + newChild.ChildGenderType + "</td>";
        row += "<td>" + newChild.ChildPhone + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeleteChildren(' + "'" + newChild.ChildInternationalCode + "'" +');"> حذف </button></td></tr>';
		Debug(row);
        return row;
    } else
        return null;
}

function AddNewHamsar() {

    var newHamsar = {
        NewHamsarFirstName: $("#NewHamsarFirstName").val(),
        NewHamsarLastName: $("#NewHamsarLastName").val(),
        NewHamsarInternationalCode: $("#NewHamsarInternationalCode").val(),
        NewHamsarGenderType: $("#NewHamsarGenderType").val(),
        NewHamsarPhone: $("#NewHamsarPhone").val(),
        NewHamsarJob: $("#NewHamsarJob").val(),
        NewHamsarJobPlace: $("#NewHamsarJobPlace").val()
    }

    var hasError = false;
    if (newHamsar.NewHamsarFirstName == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا نام را وارد نمایید", null);
    } else if (newHamsar.NewHamsarGenderType == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نوع جنسیت را وارد نمایید", null);
    } else if (newHamsar.NewHamsarLastName == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نام خانوادگی را وارد نمایید", null);
    } else if (newHamsar.NewHamsarInternationalCode == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else if (newHamsar.NewHamsarPhone == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا شماره تماس را وارد نمایید", null);
    } else {
        for (var i = 0; i < listOfMates.length; i++) {
            if (listOfMates[i].NewHamsarInternationalCode == newHamsar.NewHamsarInternationalCode) {
                CustomModalAlert("خطا", "این کد ملی قبلا به عنوان همسر استفاده شده است.", null);
                hasError = true;
                break;
            }
        }
    }
    if (hasError == false) {
        listOfMates.push(newHamsar);
		
        var index = listOfMates.length - 1;
        var row = "<tr>";
        row += "<td>" + newHamsar.NewHamsarFirstName + "</td>";
        row += "<td>" + newHamsar.NewHamsarLastName + "</td>";
        row += "<td>" + newHamsar.NewHamsarInternationalCode + "</td>";
        row += "<td>" + newHamsar.NewHamsarGenderType + "</td>";
        row += "<td>" + newHamsar.NewHamsarPhone + "</td>";
        row += "<td>" + newHamsar.NewHamsarJob + "</td>";
        row += "<td>" + newHamsar.NewHamsarJobPlace + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteHamsar(' + "'" + newHamsar.NewHamsarInternationalCode + "'" + ');"> حذف </button></td></tr>';
		Debug(row);
        return row;
    } else return null;
}

function AddNewEtc() {
    var newEtc = {
        NewCausinFirstName: $("#NewCausinFirstName").val(),
        NewCausinLastName: $("#NewCausinLastName").val(),
        NewCausinGenderType: $("#NewCausinGenderType").val(),
        NewCausinRelation: $("#NewCausinRelation").val(),
        NewCausinInternationalCode: $("#NewCausinInternationalCode").val(),
        NewCausinAge: $("#NewCausinAge").val()
    }

    var hasError = false;
    if (newEtc.NewCausinFirstName == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا نام را وارد نمایید", null);
    } else if (newEtc.NewCausinGenderType == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نوع جنسیت را وارد نمایید", null);
    } else if (newEtc.NewCausinLastName == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نام خانوادگی را وارد نمایید", null);
    } else if (newEtc.NewCausinInternationalCode == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else if (newEtc.NewCausinRelation == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا نسبت را وارد نمایید", null);
    } else if (newEtc.NewCausinAge == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا سن را مشخص نمایید.", null);
    } else {
        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
        console.log(listOfEtc);
        for (var i = 0; i < listOfEtc.length; i++) {
            alert(listOfEtc[i].NewCausinInternationalCode + " : " + newEtc.NewCausinInternationalCode);
            if (listOfEtc[i].NewCausinInternationalCode == newEtc.NewCausinInternationalCode) {
                CustomModalAlert("خطا", "این کد ملی قبلا به عنوان تحت تکفل استفاده شده است.", null);
                hasError = true;
                break;
            }
        }
    }
    if (hasError == false) {
        listOfEtc.push(newEtc);
        var index = listOfEtc.length - 1;
        var row = "<tr>";
        row += "<td>" + newEtc.NewCausinFirstName + "</td>";
        row += "<td>" + newEtc.NewCausinLastName + "</td>";
        row += "<td>" + newEtc.NewCausinInternationalCode + "</td>";
        row += "<td>" + newEtc.NewCausinGenderType + "</td>";
        row += "<td>" + newEtc.NewCausinAge + "</td>";

        row += "<td>" + newEtc.NewCausinRelation + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteCausin(' + "'" + newEtc.NewCausinInternationalCode + "'" + ');"> حذف </button></td></tr>';
		
		Debug(row);
        return row;
    } else return null;
}

function SearchForExistChild() {
    var ChildInternationalCode = $("#ChildInternationalCode").val();
    if (ChildInternationalCode == "") {
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else {
        $.ajax({
            type: 'GET',
            url: ServerURL + "Account/GetUserSummery",
            dataType: 'json',
            data: {
                userName: ChildInternationalCode
            },
            success: function (result) {
                if (result.Status == true) {
                    Debug(result.Result);
                    var phone;
                    if (result.Result.Phone != "")
                        phone = result.Result.Phone;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Work;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Mobile;
                    var newChild = {
                        ChildFirstName: result.Result.FirstName,
                        ChildLastName: result.Result.LastName,
                        ChildGenderType: result.Result.Gender,
                        ChildPhone: phone,
                        ChildInternationalCode: ChildInternationalCode
                    };
                    $("#ChildFirstName").val(newChild.ChildFirstName);
                    $("#ChildLastName").val(newChild.ChildLastName);
                    $("#ChildPhone").val(newChild.ChildPhone);
                    $("#ChildInternationalCode").val(newChild.ChildInternationalCode);
                    $("#ChildGenderType option:selected").attr("selected", false);
                    if (newChild.ChildGenderType == true)
                        $("#ChildGenderType1").attr("selected", true);
                    else
                        $("#ChildGenderType2").attr("selected", true);
                } else {
                    CustomModalAlert("خطا", "اطلاعات کد ملی در سیستم ثبت نشده است", null);
                }
            },
            error: function () {},
            async: false
        });
    }
}

function SearchForExistMate() {
    var MateInternationalCode = $("#NewHamsarInternationalCode").val();
    if (MateInternationalCode == "") {
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else {
        $.ajax({
            type: 'GET',
            url: ServerURL + "Account/GetUserSummery",
            dataType: 'json',
            data: {
                userName: MateInternationalCode
            },
            success: function (result) {
                if (result.Status == true) {
                    Debug(result.Result);
                    var phone;
                    if (result.Result.Phone != "")
                        phone = result.Result.Phone;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Work;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Mobile;
                    var job, jobPlace;
                    if (result.Result.IsUniversityOfTehran == 1) {
                        job = "دانشگاه تهران";
                        jobPlace = job;
                    } else {
                        job = "غیر دانشگاه تهران";
                        jobPlace = result.Result.JobPlace;
                    }

                    var newHamsar = {
                        NewHamsarFirstName: result.Result.FirstName,
                        NewHamsarLastName: result.Result.LastName,
                        NewHamsarGenderType: result.Result.Gender,
                        NewHamsarPhone: phone,
                        NewHamsarJob: job,
                        NewHamsarJobPlace: jobPlace
                    };

                    $("#NewHamsarFirstName").val(newHamsar.NewHamsarFirstName);
                    $("#NewHamsarLastName").val(newHamsar.NewHamsarLastName);
                    $("#NewHamsarPhone").val(newHamsar.NewHamsarPhone);
                    $("#NewHamsarJob").val(newHamsar.NewHamsarJob);
                    $("#NewHamsarJobPlace").val(newHamsar.NewHamsarJobPlace);
                    $("#NewHamsarGenderType option:selected").attr("selected", false);
                    if (newHamsar.NewHamsarGenderType == true)
                        $("#NewHamsarGenderType1").attr("selected", true);
                    else
                        $("#NewHamsarGenderType2").attr("selected", true);

                } else {
                    CustomModalAlert("خطا", "اطلاعات کد ملی در سیستم ثبت نشده است", null);
                }
            },
            error: function () {},
            async: false
        });
    }
}

function SearchForExistCausin() {
    var CausinInternationalCode = $("#NewCausinInternationalCode").val();
    if (CausinInternationalCode == "") {
        CustomModalAlert("خطا", "لطفا کد ملی را وارد نمایید", null);
    } else {
        $.ajax({
            type: 'GET',
            url: ServerURL + "Account/GetUserSummery",
            dataType: 'json',
            data: {
                userName: CausinInternationalCode
            },
            success: function (result) {
                if (result.Status == true) {
                    Debug(result.Result);
                    var phone;
                    if (result.Result.Phone != "")
                        phone = result.Result.Phone;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Work;
                    else if (result.Result.Phone != "")
                        phone = result.Result.Mobile;
                    var newEtc = {
                        NewCausinFirstName: result.Result.FirstName,
                        NewCausinLastName: result.Result.LastName,
                        NewCausinGenderType: result.Result.Gender
                    };
                    $("#NewCausinFirstName").val(newEtc.NewCausinFirstName);
                    $("#NewCausinLastName").val(newEtc.NewCausinLastName);
                    $("#NewCausinGenderType option:selected").attr("selected", false);
                    if (newEtc.NewCausinGenderType == true)
                        $("#NewCausinGenderType1").attr("selected", true);
                    else
                        $("#NewCausinGenderType2").attr("selected", true);
                } else {
                    CustomModalAlert("خطا", "اطلاعات کد ملی در سیستم ثبت نشده است", null);
                }
            },
            error: function () {},
            async: false
        });
    }
}

function ClearRelationalTable() {
    listOfMates.splice(0, listOfMates.length);
    listOfEtc.splice(0, listOfEtc.length);
    listOfChildrens.splice(0, listOfChildrens.length);
	    $("#MemberInfoChilds tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
	    $("#MemberInfoHamsars tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
	    $("#MemberInfoTakafolEtc tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
	
}