//Region : Global Variables
//Region : Functions
function Debug(message) {
    console.log(message);
}

function ShowAllPayments()
{
	for (var i = 0; i < listOfChildrens.length; i++) {
		Debug(listOfChildrens[i]);
	}
}


function CustomModalAlert(title, desc, callback) {
    alert(desc);
}

function DeletePayment(PaymentId) {
	DeletePaymentّFromDatabase(PaymentId);
    for (var i = 0; i < listOfPayments.length; i++) {
        if (listOfPayments[i].PaymentID == PaymentId) {
            listOfPayments.splice(i, 1);
			ShowAllPayments();
            break;
        }
    }
}


function ClearPaymentForm() 
{
    $("#paymentFee").val("");
    $("#paymentBank").val("");
    $("#paymentCode").val("");
}


function AddNewPayment() {
    var newPayment = {
        PaymentCode: $("#paymentCode").val(),
        PaymentFee: $("#paymentFee").val(),
        PaymentBank: $("#paymentBank").val(),
        PaymentDateDay: $("#PaymentDateDay").val(),
		PaymentDateMonth: $("#PaymentDateMonth").val(),
		PaymentDateYear: $("#PaymentDateYear").val(),
		PaymentMethod : $("#paymentMethod").val(),
		PaymentID : -1,
		userName : $("#MemberInfoInternationalCode").val() 
		
    };
    var hasError = false;
    if (newPayment.PaymentCode == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا کد فیش را وارد نمایید", null);
    } else if (newPayment.PaymentFee == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا مبلغ را وارد نمایید", null);
    } else if (newPayment.PaymentBank == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا بانک مبدا را وارد نمایید", null);
    } 
    if (hasError == false) {
		AddPaymentToDatabase(newPayment,function(code){
		console.log("Code is : " + code);
		newPayment.PaymentID = code;
		listOfPayments.push(newPayment);
        var index = listOfPayments.length - 1;
        var row = "<tr>";
		row += "<td>" + newPayment.PaymentID + "</td>";
        row += "<td>" + newPayment.PaymentCode + "</td>";
        row += "<td>" + newPayment.PaymentFee + "</td>";
		row += "<td>" + newPayment.PaymentDateYear + "/" + newPayment.PaymentDateMonth + "/" + newPayment.PaymentDateDay + "</td>";
        row += "<td>" + newPayment.PaymentBank + "</td>";
        row += '<td><button  style="width:50%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove(); DeletePayment(' + "'" + newPayment.PaymentID + "'" +');"> حذف </button>';
		row += '<button  style="width:50%" class="btn btn-large btn-info" onclick="selectedRow = $(this).parent().parent();ShowUpdatePayment(' + newPayment.PaymentID  + ');"> ویرایش </button></td></tr>';
		Debug("New Row is : " + row);
		$("#MemberInfoPaymentTable").append(row);
			
			},null);
    } 
}

function UpdatePayment()
{
	console.log("Update Payment : " + selectedPaymentId);
	 var newPayment = {
        PaymentCode: $("#paymentCode").val(),
        PaymentFee: $("#paymentFee").val(),
        PaymentBank: $("#paymentBank").val(),
        PaymentDateDay: $("#PaymentDateDay").val(),
		PaymentDateMonth: $("#PaymentDateMonth").val(),
		PaymentDateYear: $("#PaymentDateYear").val(),
		PaymentMethod : $("#paymentMethod").val(),
		PaymentID : selectedPaymentId,
		userName : $("#MemberInfoInternationalCode").val() 
    };
	
	var tdId = selectedRow.children("td:nth-child(1)"); 
	var tdCode = selectedRow.children("td:nth-child(2)"); 
	var tdFee = selectedRow.children("td:nth-child(3)");
	var tdPaymentDate = selectedRow.children("td:nth-child(4)");
	var tdSrcBank = selectedRow.children("td:nth-child(5)");
	
	tdCode.html(newPayment.PaymentCode);
	tdFee.html(newPayment.PaymentFee);
	tdPaymentDate.html(newPayment.PaymentDateYear + "/" + newPayment.PaymentDateMonth + "/" + newPayment.PaymentDateDay);
	tdSrcBank.html(newPayment.PaymentBank);
	console.log(tdId.html() + " : " + tdCode.html() + " : " + tdFee.html() + " : " + tdPaymentDate.html() + " : " + tdSrcBank.html());
	
}

function AddPaymentToDatabase(newPayment ,successCallback, errorCallback)
{
	 CustomBlockingPanel('توجه', 'در حال ثبت تغییرات....', -1, null);
	 $.ajax({
        type: 'POST',
        url: ServerURL + "Account/AddPaymentForUser",
        dataType: 'json',
		data : newPayment,
        success: function (result) 
			{					
				if(result.Status == true)
				{
					 CustomAlert('توجه', 'تغییرات با موفقیت انجام گردید', null);
					 //$("div[name=PanelWindow]").hide();
					 if(successCallback != null)
					 	successCallback(result.Result);
				}
				else
				{
					CustomAlert('توجه', 'ثیت تغییرات با خطاروبرو گردبد', null);
					if(errorCallback != null)
						errorCallback();
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

function DeletePaymentّFromDatabase(paymentID)
{
	CustomBlockingPanel('توجه', 'در حال حذف کردن ....', -1, null);
	var ProfileNationalityCode = $("#MemberInfoInternationalCode").val();
	 $.ajax({
        type: 'GET',
        url: ServerURL + "Account/DeletePayment",
        dataType: 'json',
		data : {userName : ProfileNationalityCode, paymentId : paymentID},
        success: function (result) {
				if(result.Status == true){
					CustomAlert('توجه', 'با موفقبت حذف صورت پذیرفت', null);
				}
				else{
					CustomAlert('توجه', 'حذف کردن پرداخت با خطا روبرو گردید', null);
				}
			},
		error: function(){
				CustomAlert('توجه', 'حذف کردن پرداخت با خطا روبرو گردید', null);
			},
		async : true
	 });
}

function ClearPaymentTable() {
    listOfPayments.splice(0, listOfPayments.length);
	    $("#MemberInfoPaymentTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
}