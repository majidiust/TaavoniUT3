//Region : Global Variables
var selectedMember ; 

//Region : Functions
function Debug(message)
{
	console.log(message);
}

function LoadUserDetails(nationalityCode)
{
	selectedMember = nationalityCode;
	ClearRelationalTable();
	LoadGeneralInfo(nationalityCode);
	LoadContactInfo(nationalityCode);
	LoadIsargariInfo(nationalityCode);
	LoadJobInfo(nationalityCode);
	LoadFamilyInfo(nationalityCode);
	LoadPayments(nationalityCode);
    LoadTotalPayment(nationalityCode);
}

function LoadGeneralInfo(nationalityCode)
{
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserGeneralInfo",
        dataType: 'json',
		data : { userName : nationalityCode },
        success: function (result) {
			if(result.Status == true){
				var birthDate = result.Result.BirthDate.split(":");
				console.log(result.Result);
				console.log(result.Result.Gender);
				console.log(result.Result.FirstName + " " + result.Result.LastName);
				$("#EditMemberInfoGender option:selected").attr("selected", false);
				var gender = result.Result.Gender == true ? 1 : 2;
				$("#EditMemberInfoGender" + gender).attr("selected", true);
				$("#EditMemberInfoCity option:selected").attr("selected", false);
				$("#EditMemberInfoCity"+result.Result.City).attr("selected", true);
				$("#MemberInfoDegree option:selected").attr("selected", false);
				$("#MemberInfoDegree"+result.Result.Degree).attr("selected", true);
				$("#EditMemberInfoName").html(result.Result.FirstName + " " + result.Result.LastName);
				$("#EditMemberInfoNationalID").html(result.Result.ID);
				$("#MemberInfoFirstName").val(result.Result.FirstName);
				$("#MemberInfoLastName").val(result.Result.LastName);
				$("#MemberInfoInternationalCode").val(result.Result.ID);
				$("#MemberInfoShenasname").val(result.Result.IDCard);
				$("#MemberInfoShenasnamePlace").val(result.Result.IDPlacce);
				$("#MemberInfoPersonID").val(result.Result.PersonalNumber);
				$("#MemberInfoBirthdateYear option[value="+birthDate[0]+"]").attr("selected", true);
				$("#MemberInfoBirthdateMonth option[value="+birthDate[1]+"]").attr("selected", true);
				$("#MemberInfoBirthdateDay option[value="+birthDate[2]+"]").attr("selected", true);
				Debug(ServerURL+"Pics/Users/Originals/" + nationalityCode + ".png");
				$("#EditProfileImageImage").prop("src",ServerURL+"Pics/Users/Thumbnails/" + nationalityCode + ".png?" + new Date().getTime());
				if(result.Result.activity == true)
					$("#MemberInfoActivity").html("فعال است");
				else
					$("#MemberInfoActivity").html("غیر فعال است");
				$("#MemberInfoPoint").html("امتیاز کاربر : "  + result.Result.Point);
			
			}
			else{
			}
		},
		error: function(result) {
		},
		async:true
		});
}

function  LoadTotalPayment(nationalityCode)
{
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetTotalPaymentByUser",
        dataType: 'json',
		data : { userName : nationalityCode },
        success: function (result) {
			if(result.Status == true){
			    $("#EditMemberInfoTotalPayment").html(result.Result.TotalFee);
                console.log("جمع پرداختی : " + result.Result.TotalFee + " ریال ");
			}
            else{
                console.log(result.Message);
            }
            },
            async:true   
            });
}

function LoadContactInfo(nationalityCode)
{
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserContactInfo",
        dataType: 'json',
		data : { userName : nationalityCode },
        success: function (result) {
			if(result.Status == true){
				$("#MemberInfoEmail").val(result.Result.EMail);
				$("#MemberInfoMobile").val(result.Result.Mobile);
				$("#MemberInfoHomePhone").val(result.Result.PhoneNumber);
				$("#MemberInfoWorkPhone").val(result.Result.WorkPhone);
			}
			else{
			}
		},
		error: function(){},
		async:true});
}

function LoadJobInfo(nationalityCode)
{
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserJobInfo",
        dataType: 'json',
		data : { userName : nationalityCode },
        success: function (result) {
			if(result.Status == true){	
				var birthDate = result.Result.FromDate.split(":");			
				$("#MemberInfoJob1Concept option:selected").attr("selected", false);
				$("#MemberInfoJob1Concept"+result.Result.Concept).attr("selected", true);
				$("#MemberInfoJobStatus option:selected").attr("selected", false);
				$("#MemberInfoJobStatus"+result.Result.JobState).attr("selected", true);
				$("#MemberInfoOtherType option:selected").attr("selected", false);
				$("#MemberInfoOtherType"+result.Result.JobOtherType).attr("selected", true);
				$("#MemberInfoJob3University option:selected").attr("selected", false);
				$("#MemberInfoJob3University"+result.Result.University).attr("selected", true);
				$("#MemberInfoJob3Types option:selected").attr("selected", false);
				$("#MemberInfoJob3Types"+result.Result.JobType).attr("selected", true);
				$("#MemberInfoJob3ContractType option:selected").attr("selected", false);
				$("#MemberInfoJob3ContractType"+result.Result.Contract).attr("selected", true);
				$("#MemberInfoJobName").val(result.Result.JobName),
				$("#MemberInfoJobPlace").val(result.Result.JobState),
				$("#MemberInfoEmployeeDateYear option[value="+birthDate[0]+"]").attr("selected", true);
				$("#MemberInfoEmployeeDateDayMonth option[value="+birthDate[1]+"]").attr("selected", true);
				$("#MemberInfoEmployeeDateDay option[value="+birthDate[2]+"]").attr("selected", true);
				
				if ($("#MemberInfoJob1Concept").val() == 1) {
					$("#MemberInfoJob2").show();
					$("div[name=OtherJobs]").hide();
				} else if($("#MemberInfoJob1Concept").val() == 2){
					$("#MemberInfoJob2").hide();
					$("div[name=OtherJobs]").hide();
					$("#MemberInfoJob4").show();
				} else {
					$("#MemberInfoJob2").hide();
					$("div[name=OtherJobs]").hide();
				}
				
				if ($("#MemberInfoOtherType").val() == 1) {
					$("#MemberInfoJob5").show();
					$("#MemberInfoJob6").hide();
				}
				else if($("#MemberInfoOtherType").val() == 2){
					$("#MemberInfoJob5").hide();
					$("#MemberInfoJob6").show();
				}
				else{
					$("#MemberInfoJob5").hide();
					$("#emberInfoJob6").hide();
				}
			}
			else{
			}
		},
		error: function(){},
		async:true});

}

function LoadFamilyInfo(nationalityCode)
{
	LoadChildrens(nationalityCode);
	LoadMates(nationalityCode);
	LoadCausin(nationalityCode);
}


function LoadChildrens(nationalityCode)
{
	//GetListOfChildrens : userName
	CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات فرزندان ...', -1, null);
	Debug("Load Childrenn : " + nationalityCode);
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfChildrens",
        dataType: 'json',
		data : { userName : nationalityCode },
		success: function(result){
				CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
				for(var i = 0 ; i < result.Result.length ; i++)
				{
					    var newChild = {
							ChildFirstName: result.Result[i].FirstName,
							ChildLastName: result.Result[i].FirstName,
							ChildGenderType: result.Result[i].Gender,
							ChildPhone: result.Result[i].Phone,
							ChildInternationalCode: result.Result[i].InternationalCode,
						};
						 listOfChildrens.push(newChild);
        var row = "<tr>";
        row += "<td>" + newChild.ChildFirstName + "</td>";
        row += "<td>" + newChild.ChildLastName + "</td>";
        row += "<td>" + newChild.ChildInternationalCode + "</td>";
        row += "<td>" + newChild.ChildGenderType + "</td>";
        row += "<td>" + newChild.ChildPhone + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeleteChildren(' + "'" + newChild.ChildInternationalCode + "'" +');"> حذف </button></td></tr>';
		Debug(row);
       $("#MemberInfoChilds").append(row);
				}
			},
		async:true
		});
}

function LoadMates(nationalityCode)
{
	//GetListOfChildrens : userName
	CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات همسر', -1, null);
	Debug("Load Childrenn : " + nationalityCode);
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfMates",
        dataType: 'json',
		data : { userName : nationalityCode },
		success: function(result){
				CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
				for(var i = 0 ; i < result.Result.length ; i++)
				{
						var newHamsar = {
							NewHamsarFirstName: result.Result[i].FirstName,
							NewHamsarLastName: result.Result[i].LastName,
							NewHamsarInternationalCode: result.Result[i].InternationalCode,
							NewHamsarGenderType: result.Result[i].Gender,
							NewHamsarPhone: result.Result[i].Phone,
							NewHamsarJob: result.Result[i].JobName,
							NewHamsarJobPlace: result.Result[i].JobPlace,
						}
	
						listOfMates.push(newHamsar);
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
					    $("#MemberInfoHamsars").append(row);
				}
			},
		async:true
		});
}

function LoadPayments(nationalityCode)
{
//GetListOfPayment
ClearPaymentTable();
CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات پرداخت حسابها ... ', -1, null);
	Debug("Load Payments : " + nationalityCode);
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfPayment",
        dataType: 'json',
		data : { userName : nationalityCode },
		success: function(result){
				CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
				for(var i = 0 ; i < result.Result.length ; i++)
				{
				var date = result.Result[i].PaymentDate.split("/");
				console.log("Date is : "  + date);
						var newPayment = {
							 PaymentCode: result.Result[i].PaymentCode,
								PaymentFee: result.Result[i].PaymentFee,
								PaymentBank: result.Result[i].PaymentBank,
								PaymentDateDay: date[2],
								PaymentDateMonth: date[1],
								PaymentDateYear: date[0],
								PaymentMethod : result.Result[i].PaymentMethod,
								PaymentID : result.Result[i].PaymentID,
								userName : nationalityCode
						};
						console.log(newPayment);
						
						listOfPayments.push(newPayment);
						var index = listOfPayments.length - 1;
						var row = "<tr>";
						row += "<td>" + newPayment.PaymentID + "</td>";
						row += "<td>" + newPayment.PaymentCode + "</td>";
						row += "<td>" + newPayment.PaymentFee + "</td>";
						row += "<td>" + newPayment.PaymentDateYear + "/" + newPayment.PaymentDateMonth + "/" + newPayment.PaymentDateDay + "</td>";
						row += "<td>" + newPayment.PaymentBank + "</td>";
						row += '<td><button  style="width:50%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DP(' + "'" + newPayment.PaymentID + "'" +');"> حذف </button>';
						row += '<button  style="width:50%" class="btn btn-large btn-info" onclick="selectedRow = $(this).parent().parent();ShowUpdatePayment(' +  "'" +  newPayment.PaymentID+ "'"  + ');"> ویرایش </button></td></tr>';
						Debug(row);
						$("#MemberInfoPaymentTable").append(row);
				}
			},
		async:true
		});
}

function ShowUpdatePayment(PaymentId)
{
	var paymentObject;
	console.log("Update : " + PaymentId);
	for (var i = 0; i < listOfPayments.length; i++) {
        if (listOfPayments[i].PaymentID == PaymentId) {
			console.log("Update : " + PaymentId);
            paymentObject = listOfPayments[i];
            break;
        }
	}
	if(paymentObject != null)
	{
		console.log("Show Payment Update : " + paymentObject.PaymentID);
		NewPaymentMethod = 2;
		$("#paymentCode").val(paymentObject.PaymentCode);
		$("#paymentFee").val(paymentObject.PaymentFee);
		$("#paymentBank").val(paymentObject.PaymentBank);
		$("#PaymentDateDay option:selected").attr("selected", false);
		$("#PaymentDateMonth option:selected").attr("selected", false);
		$("#PaymentDateYear option:selected").attr("selected", false);
		$("#paymentMethod option:selected").attr("selected", false);
		
		console.log(paymentObject);
		$("#PaymentDateDay"+paymentObject.PaymentDateDay).attr("selected", true);
		$("#PaymentDateMonth"+paymentObject.PaymentDateMonth).attr("selected", true);
		$("#PaymentDateYear"+paymentObject.PaymentDateYear).attr("selected", true);
		$("#paymentMethod"+paymentObject.PaymentMethod).attr("selected", true);
		selectedPaymentId = paymentObject.PaymentID;
		$('#NewPayment').modal('show');
	}
}

function DP(PaymentId) {
	DeletePaymentّFromDatabase(PaymentId);
    for (var i = 0; i < listOfPayments.length; i++) {
        if (listOfPayments[i].PaymentID == PaymentId) {
            listOfPayments.splice(i, 1);
			ShowAllPayments();
            break;
        }
    }
}

function LoadCausin(nationalityCode)
{
	CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات افراد تحت تکفل', -1, null);
	Debug("Load Childrenn : " + nationalityCode);
	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfCausin",
        dataType: 'json',
		data : { userName : nationalityCode },
		success: function(result){
				CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
				for(var i = 0 ; i < result.Result.length ; i++)
				{
						var newEtc = {
							NewCausinFirstName: result.Result[i].FirstName,
							NewCausinLastName: result.Result[i].LastName,
							NewCausinGenderType: result.Result[i].Gender,
							NewCausinInternationalCode: result.Result[i].InternationalCode,
							NewCausinAge: result.Result[i].Age
						}
						listOfEtc.push(newEtc);
						var row = "<tr>";
						row += "<td>" + newEtc.NewCausinFirstName + "</td>";
						row += "<td>" + newEtc.NewCausinLastName + "</td>";
						row += "<td>" + newEtc.NewCausinInternationalCode + "</td>";
						row += "<td>" + newEtc.NewCausinGenderType + "</td>";
						row += "<td>" + newEtc.NewCausinAge + "</td>";
						row += "<td>" + newEtc.NewCausinRelation + "</td>";
						row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteCausin(' + "'" + newEtc.NewCausinInternationalCode + "'" + ');"> حذف </button></td></tr>';
						Debug(row);	
					    $("#MemberInfoTakafolEtc").append(row);
				}
			},
		async:true
		});
}


function LoadIsargariInfo(nationalityCode)
{
					$("#MemberInfoIsAzadeh").prop('checked', false);
					$("#MemberInfoIsJanbaz").prop('checked', false);
					$("#MemberInfoIsRazmande").prop('checked', false);
					$("#MemberInfoIsIsargar").prop('checked', false);
					$("#MemberInfoIsFamilyOfShahid").prop('checked', false);
					$("#MemberInfoIsChildOfShahid").prop('checked', false);
					$("#MemberInfoEsratDuration").val("");
					$("#MemberInfoJebheDuration").val("");
					$("#MemberInfoJanbaziPercent").val("");


//$('.myCheckbox').prop('checked', true);
	    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات ایثارگری ...', -1, null);

	$.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetUserIsargariInfo",
        dataType: 'json',
		data : { userName : nationalityCode },
        success: function (result) {
			if(result.Status == true){
				CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 1000, null);
				for(var i = 0 ; i < result.Result.length ; i++)
				{
					var isargariType = result.Result[i].IsargariType;
					var isargariValue = result.Result[i].IsargariValue;
					var IsargariRelation =  result.Result[i].IsargariRelation;


					
					if(isargariType == 1){
						Debug("1:" + result.Result[i]);
						$("#MemberInfoIsAzadeh").prop('checked', true);
						$("#MemberInfoEsratDuration").val(isargariValue);
					}
					else if(isargariType == 2){
						Debug("2:" + result.Result[i]);
						$("#MemberInfoIsJanbaz").prop('checked', true);
						$("#MemberInfoJanbaziPercent").val(isargariValue);
					}
					else if(isargariType == 3){
						Debug("3:" + result.Result[i]);
						$("#MemberInfoIsRazmande").prop('checked', true);
						$("#MemberInfoJebheDuration").val(isargariValue);
					}
					else if(isargariType == 4){
						Debug("4:" + result.Result[i]);
						$("#MemberInfoIsIsargar").prop('checked', true);
						$("#MemberInfoIsargariIsargarFamilyType option:selected").attr("selected", false);
						$("#MemberInfoIsargariIsargarFamilyType"+IsargariRelation).attr("selected", true);
					}
					else if(isargariType == 5){
						Debug("5:" + result.Result[i]);
						$("#MemberInfoIsFamilyOfShahid").prop('checked', true);
					}
					else if(isargariType == 6){
						Debug("6:" + result.Result[i]);
						$("#MemberInfoIsChildOfShahid").prop('checked', true);
					}
				}
			}
			else{
				CustomBlockingPanel('توجه', 'دریافت داده با خطا روبرو گردید...', 1000, null);
			}
		},
		error: function(){
			CustomBlockingPanel('توجه', 'دریافت داده با خطا روبرو گردید...', 1000, null);
			},
		async:true});
}

function SaveProfile()
{
	var newMember = { 
		ProfileFirstName : $("#MemberInfoFirstName").val(),
		ProfileLastName : $("#MemberInfoLastName").val(),
		ProfileGender : $("#EditMemberInfoGender").val(),
		ProfileDegree : $("#MemberInfoDegree").val(),
		ProfileNationalityCode : $("#MemberInfoInternationalCode").val(),
		ProfileShenasnameCode: $("#MemberInfoShenasname").val(),
        ProfileShenasnamePlace : $("#MemberInfoShenasnamePlace").val(),
		ProfilePersonID: $("#MemberInfoPersonID").val(),
		ProfileBirthdateDay : $("#MemberInfoBirthdateDay").val(),
		ProfileBirthdateMonth : $("#MemberInfoBirthdateMonth").val(),
		ProfileBirthdateYear : $("#MemberInfoBirthdateYear").val(),
		ProfileMobile : $("#MemberInfoMobile").val(),
		ProfileHomePhone : $("#MemberInfoHomePhone").val(),
		ProfileWorkPhone : $("#MemberInfoWorkPhone").val(),
		ProfileEmail : $("#MemberInfoEmail").val(),
		ProfileCity : $("#EditMemberInfoCity").val(),
		NewMemberEmployeeDateDay : $("#MemberInfoEmployeeDateDay").val(),
		NewMemberEmployeeDateYear : $("#MemberInfoEmployeeDateYear").val(),
		NewMemberEmployeeDateMonth : $("#MemberInfoEmployeeDateMonth").val(),
		NewMemberContractType : $("#MemberInfoJob3ContractType").val(),
		NewMemberJobType : $("#MemberInfoJob3Types").val(),
		NewMemberJobConcept : $("#MemberInfoJob1Concept").val(),
		NewMemberJobStatus : $("#MemberInfoJobStatus").val(),
		NewMemberJobName : $("#MemberInfoJobName").val(),
		NewMemberJobPlace : $("#MemberInfoJobPlace").val(),
		NewMemberOthertype: $("#MemberInfoOtherType").val(),
		NewMemberJob3University: $("#MemberInfoJob3University").val(),
		NewMemberIsAzadeh : $("#MemberInfoIsAzadeh").is(":checked"),
		NewMemberIsJanbaz : $("#MemberInfoIsJanbaz").is(":checked"),
		NewMemberIsRazmande: $("#MemberInfoIsRazmande").is(":checked"),
		NewMemberIsIsargar : $("#MemberInfoIsIsargar").is(":checked"),
		NewMemberIsFamilyOfShahid : $("#MemberInfoIsFamilyOfShahid").is(":checked"),
		NewMemberIsChildOfShahid : $("#MemberInfoIsChildOfShahid").is(":checked"),
		NewMemberEsratDuration : $("#MemberInfoEsratDuration").val(),
		NewMemberJanbaziPercent: $("#MemberInfoJanbaziPercent").val(),
		NewMemberJebheDuration: $("#MemberInfoJebheDuration").val(),
		NewMemberIsargariIsargarFamilyType: $("#MemberInfoIsargariIsargarFamilyType").val(),
		NewMemberPictureName : temporalPictureName
		}
	Debug(newMember);
	
	    CustomBlockingPanel('توجه', 'در حال ثبت تغییرات....', -1, null);

	 $.ajax({
        type: 'POST',
        url: ServerURL + "Account/EditMemebr",
        dataType: 'json',
		data : newMember,
        success: function (result) 
			{
			var nationalityCode = newMember.ProfileNationalityCode;
					for(var i = 0 ; i < listOfChildrens.length ; i++){
						listOfChildrens[i].userName = nationalityCode;
						$.ajax({
							type: 'POST',
							url: ServerURL + "Account/AddChild",
							dataType: 'json',
							data : listOfChildrens[i],
							async:false
						});
					}
					for(var i = 0 ; i < listOfMates.length ; i++){
						listOfMates[i].userName = nationalityCode;
						$.ajax({
							type: 'POST',
							url: ServerURL + "Account/AddHamsar",
							dataType: 'json',
							data : listOfMates[i],
							async:false
						});
					}
					for(var i = 0 ; i < listOfEtc.length ; i++){
						listOfEtc[i].userName = nationalityCode;
						$.ajax({
							type: 'POST',
							url: ServerURL + "Account/AddCausin",
							dataType: 'json',
							data : listOfEtc[i],
							async:false
						});
					}
					
				if(result.Status == true)
				{
					 CustomAlert('توجه', 'تغییرات با موفقیت انجام گردید', null);
					 $("div[name=PanelWindow]").hide();
				}
				else
				{
					CustomAlert('توجه', 'ثیت تغییرات با خطاروبرو گردبد', null);
				}
				Debug(result.Message);
			},
		error : function()
			{
				CustomAlert('توجه', 'ثیت تغییرات با خطاروبرو گردبد', null);
			},
        async: true
    });
}

function ActivateMember()
{
	CustomBlockingPanel('توجه', 'در حال فعال سازی عضو....', -1, null);
	var ProfileNationalityCode = $("#MemberInfoInternationalCode").val();
	 $.ajax({
        type: 'GET',
        url: ServerURL + "Account/ActivateMember",
        dataType: 'json',
		data : {ProfileNationalityCode : ProfileNationalityCode},
        success: function (result) {
				if(result.Status == true){
					CustomAlert('توجه', 'فعال سازی با موفقیت انجام شد.', null);
					$("#MemberInfoActivity").html("فعال است");
				}
				else{
					CustomAlert('توجه', 'فعال سازی عضو با خطا روبرو گردید', null);
				}
			},
		error: function(){
				CustomAlert('توجه', 'فعال سازی عضو با خطا روبرو گردید', null);
			},
		async : true
	 });
}

function DeActivateMember()
{
	CustomBlockingPanel('توجه', 'در حال غیر فعال سازی عضو....', -1, null);
	var ProfileNationalityCode = $("#MemberInfoInternationalCode").val();
	 $.ajax({
        type: 'GET',
        url: ServerURL + "Account/DeActivateMember",
        dataType: 'json',
		data : {ProfileNationalityCode : ProfileNationalityCode},
        success: function (result) {
				if(result.Status == true){
					CustomAlert('توجه', 'غیر فعال سازی با موفقیت انجام شد.', null);
					$("#MemberInfoActivity").html("غیر فعال است");
				}
				else{
					CustomAlert('توجه', 'غیر فعال سازی عضو با خطا روبرو گردید', null);
				}
			},
		error: function(){
				CustomAlert('توجه', 'غیر فعال سازی عضو با خطا روبرو گردید', null);
			},
		async : true
	 });
}
