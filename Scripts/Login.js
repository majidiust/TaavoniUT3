var isShowRegisterationForm = false;
function LoginToAccountUp()
{
    var m_userName = $("#usernameUp").val();
    var m_password = $("#passwordUp").val();
    if(m_userName == "" || m_password == "")
    {
        $("#LoginMessageUp").html("نام کاربری و کلمه عبور را وارد کنید.");
        $("#LoginMessageUp").show('slow');
        setTimeout(function(){
            $("#LoginMessageUp").hide('slow');
        }, 3000);
    }
    else
    {
        $("#LoginMessageUp").html("در حال بررسی نام کاربری و کلمه عبور");
        $("#LoginButtonUp").hide('slow');
        $("#LoginMessageUp").show('slow');
        //Call Ajax
        LoginData=
        {username: m_userName, password: m_password, rememberMe: true };

        $.ajax({
            type: 'POST',
            url: ServerURL + "Account/SignInToServer",
            dataType: 'json',
            success: function(result) {

                if(result.Status == true)
                {
                    $("#LoginMessageUp").html("در حال ورود به سامانه");
                    $("#LoginMessageUp").show('slow');
                    //Login To System
                    setTimeout(function () {
                        DetectLoggedInUser();
                        $.modal.close();
                    }, 1000);
                }
                else
                {
					//alert(result.Message);
                    if(result.Message.indexOf("another") != -1){
                        $("#LoginMessageUp").html("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");
                        setTimeout(function () {
                            $("#LoginMessageUp").hide('slow');
                            $("#LoginButtonUp").show('slow');
                        }, 3000);
                    }
                    else{
						
                        if(result.Message.indexOf("activated") != -1){
                            $("#LoginMessageUp").html("نام کاربری شما فعال نشده است.");
                        }
                        else if(result.Message.indexOf("approved") != -1){
                            $("#LoginMessageUp").html("نام کاربری شما هنوز تایید نشده است.");
                        }
                        else{
							
                            $("#LoginMessageUp").html("نام کاربری و یا کلمه عبور نادرست است.");
                        }

                        setTimeout(function () {
                            $("#LoginMessageUp").hide('slow');
                            $("#LoginButtonUp").show('slow');
                        }, 3000);
                    }

                }
            },
            data:  LoginData,
            async: true

        });
    }
}
function LoginToAccount()
{
	var m_userName = $("#username").val();
	var m_password = $("#password").val();
	if(m_userName == "" || m_password == "")
	{
		$("#LoginMessage").html("نام کاربری و کلمه عبور را وارد کنید.");
		$("#LoginMessage").show('slow');
		setTimeout(function(){
			$("#LoginMessage").hide('slow');
			}, 3000);
	}
	else
	{
		$("#LoginMessage").html("در حال بررسی نام کاربری و کلمه عبور");
		$("#LoginButton").hide('slow');
		$("#LoginMessage").show('slow');
		//Call Ajax
		LoginData=
		{username: m_userName, password: m_password, rememberMe: true };
			
		$.ajax({
    			type: 'POST',
    			url: ServerURL + "Account/SignInToServer",
    			dataType: 'json',
    			success: function(result) {
		
			if(result.Status == true)
			{
				$("#LoginMessage").html("در حال ورود به سامانه");
				$("#LoginMessage").show('slow');
                //Login To System
				setTimeout(function () {
					DetectLoggedInUser();
					}, 1000);
			}
			else
			{
//				alert (result.Message);
				if(result.Message.indexOf("another") != -1){
					$("#LoginMessage").html("کاربری با این نام قبلا وارد شده است. لطفا دقایقی دیگر مجددا تلاش کنید.");
					setTimeout(function () {
						$("#LoginMessage").hide('slow');
						$("#LoginButton").show('slow');
					}, 3000);
				}
				else{

					if(result.Message.indexOf("activated") != -1){
						$("#LoginMessage").html("نام کاربری شما فعال نشده است.");
					}
					else if(result.Message.indexOf("approved") != -1){
						$("#LoginMessage").html("نام کاربری شما هنوز تایید نشده است.");
					}
					else{
						$("#LoginMessage").html("نام کاربری و یا کلمه عبور نادرست است.");
					}
					
					setTimeout(function () {
						$("#LoginMessage").hide('slow');
						$("#LoginButton").show('slow');
					}, 3000);
				}
			   
			}
			},
			data:  LoginData,
    			async: true
				
		});
	}
}

function LoginKeyDown(event)
{
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if(keyCode == 13)
    {
        LoginToAccount();
    }
}
function RegisterKeyDown(event)
{
	    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if(keyCode == 13)
    {
        RegisterToServer();
    }
}
function LoginKeyDownUp(event)
{
    var keyCode = ('which' in event) ? event.which : event.keyCode;
    if(keyCode == 13)
    {
        LoginToAccountUp();
    }
}

function ShowRegisterForm()
{
	if(isShowRegisterationForm == false)
	{
		$("#login-box").fadeOut(500,function(){$("#RegisterBox").fadeIn(1000);});
		
		isShowRegisterationForm = true;
	}
	else {
		$("#RegisterBox").fadeOut(500,function(){$("#login-box").fadeIn(1000);});
							
		isShowRegisterationForm = false;
	}
}


function RegisterToServer()
{
	var m_uname = $("#uname").val();
	var m_email = $("#email").val();
	var m_pass = $("#pass").val();
	var m_confirmPass = $("#passConfirm").val();
	if(m_uname == "")
	{
		ShowRegisterationError(3);
	}
	else if(m_email == "")
	{
		ShowRegisterationError(3);
	}
	else if(validEmail(m_email) == false) {
		ShowRegisterationError(3);
	}
	else if(m_pass == "")
	{
		ShowRegisterationError(3);
	}
	else if(m_confirmPass == "") {
		ShowRegisterationError(3);
	}
	else if(m_confirmPass != m_pass) {
		$("#RegisterMessage").html("کلمه عبور و تکرار آن با هم برابر نیستند.");
		$("#RegisterMessage").show();
				setTimeout(function(){
					$("#RegisterMessage").hide();
				},3000);
	}
	else {
		$("#RegisterMessage").html("در حال ثبت نام....");
		$("#RegisterMessage").show();
		$.getJSON(ServerURL + "Account/RegisterToServer",
		{username:m_uname,password:m_pass,email:m_email},
		function(result){
				if(result.Status == false) {
				if(result.Message.indexOf("Username already exists. Please enter a different user name") != -1)
				{
					$("#RegisterMessage").html("کاربری با این نام در سامانه وجود دارد");
				}
				else if(result.Message.indexOf("A username for that e-mail address already exists. Please enter a different e-mail address.") != -1){
					$("#RegisterMessage").html("کاربری با این پست الکترونیکی در سیستم وجود دارد.");
				}
				else if(result.Message.indexOf("The password provided is invalid. Please enter a valid password value.") != -1)
				{
					$("#RegisterMessage").html("کلمه عبور وارد شده معتبر نیست. لطفا یک کلمه عبور معتبر وارد نمایید");
				}
				else if(result.Message.indexOf("The e-mail address provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage").html("آدرس پست الکترونیکی وارد شده معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The password retrieval answer provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage").html(" پاسخ شما به سوال امنیتی معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The password retrieval question provided is invalid. Please check the value and try again.")!= -1)
				{
					$("#RegisterMessage").html("سوال امنیتی شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The user name provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage").html("نام کاربری شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1)
				{
					$("#RegisterMessage").html("در بخش پشتیبانی اعتبارسنجی خطایی رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
				}
				else if(result.Message.indexOf("The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1)
				{
					$("#RegisterMessage").html("درخواست ساخت این کاربر لغو شده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید. ");
				}
				else if(result.Message.indexOf("An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.")!= -1)
				{
					$("#RegisterMessage").html("خطای ناشناخته ای در سیستم رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
				}
				$("#RegisterMessage").show();
				setTimeout(function(){
					$("#RegisterMessage").hide();
				},3000);
			}
			else
			{
				$("#RegisterMessage").hide();
				$("#RegisterMessage").html("ثبت نام شما با موفقیت انجام شد و اطلاعات آن به پست الکترونیکی شما ارسال میشود. برای تکمیل ثیت نام به پست الکترونیکی خود مراجعه کنید.");
				$("#RegisterMessage").show();
				setTimeout(function(){
					$("#RegisterMessage").hide();
					ShowRegisterForm();
					ClearRegisterForm();
					},5000);
			}
		}
		);
	}
}



function RegisterToServer2()
{
	var m_uname = $("#uname2").val();
	var m_email = $("#email2").val();
	var m_pass = $("#pass2").val();
	var m_confirmPass = $("#passConfirm2").val();
	if(m_uname == "")
	{
		ShowRegisterationError(3);
	}
	else if(m_email == "")
	{
		ShowRegisterationError(3);
	}
	else if(validEmail(m_email) == false) {
		ShowRegisterationError(3);
	}
	else if(m_pass == "")
	{
		ShowRegisterationError(3);
	}
	else if(m_confirmPass == "") {
		ShowRegisterationError(3);
	}
	else if(m_confirmPass != m_pass) {
		$("#RegisterMessage2").html("کلمه عبور و تکرار آن با هم برابر نیستند.");
		$("#RegisterMessage2").show();
				setTimeout(function(){
					$("#RegisterMessage2").hide();
				},3000);
	}
	else {
		$("#RegisterMessage2").html("در حال ثبت نام....");
		$("#RegisterMessage2").show();
		$.getJSON(ServerURL + "Account/RegisterToServer",
		{username:m_uname,password:m_pass,email:m_email},
		function(result){
				if(result.Status == false) {
				if(result.Message.indexOf("Username already exists. Please enter a different user name") != -1)
				{
					$("#RegisterMessage2").html("کاربری با این نام در سامانه وجود دارد");
				}
				else if(result.Message.indexOf("A username for that e-mail address already exists. Please enter a different e-mail address.") != -1){
					$("#RegisterMessage2").html("کاربری با این پست الکترونیکی در سیستم وجود دارد.");
				}
				else if(result.Message.indexOf("The password provided is invalid. Please enter a valid password value.") != -1)
				{
					$("#RegisterMessage2").html("کلمه عبور وارد شده معتبر نیست. لطفا یک کلمه عبور معتبر وارد نمایید");
				}
				else if(result.Message.indexOf("The e-mail address provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage2").html("آدرس پست الکترونیکی وارد شده معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The password retrieval answer provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage2").html(" پاسخ شما به سوال امنیتی معتبر نیست. لطفا بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The password retrieval question provided is invalid. Please check the value and try again.")!= -1)
				{
					$("#RegisterMessage2").html("سوال امنیتی شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The user name provided is invalid. Please check the value and try again.") != -1)
				{
					$("#RegisterMessage2").html("نام کاربری شما معتبر نیست. لطفا اعتبار آن را بررسی و دوباره امتحان نمایید.");
				}
				else if(result.Message.indexOf("The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1)
				{
					$("#RegisterMessage2").html("در بخش پشتیبانی اعتبارسنجی خطایی رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
				}
				else if(result.Message.indexOf("The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.") != -1)
				{
					$("#RegisterMessage2").html("درخواست ساخت این کاربر لغو شده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید. ");
				}
				else if(result.Message.indexOf("An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.")!= -1)
				{
					$("#RegisterMessage2").html("خطای ناشناخته ای در سیستم رخ داده است. لطفا ورودی خود را بررسی و دوباره امتحان نمایید. اگر مشکل باقی بود لطفا با مدیر سیستم تماس بگیرید.");
				}
				$("#RegisterMessage2").show();
				setTimeout(function(){
					$("#RegisterMessage2").hide();
				},3000);
			}
			else
			{
				$("#RegisterMessage2").hide();
				$("#RegisterMessage2").html("ثبت نام شما با موفقیت انجام شد و اطلاعات آن به پست الکترونیکی شما ارسال میشود. برای تکمیل ثیت نام به پست الکترونیکی خود مراجعه کنید.");
				$("#RegisterMessage2").show();
				setTimeout(function(){
					$("#RegisterMessage2").hide();
					ShowRegisterForm();
					ClearRegisterForm();
					},5000);
			}
		}
		);
	}
}


function ClearRegisterForm()
{
	$("#RegisterMessage").html("");
	$("#uname").val("");
	$("#email").val("");
	$("#pass").val("");
	$("#passConfirm").val("");
}


function ShowRegisterationError(errorType)
{
	var m_uname = $("#uname").val();
	var m_email = $("#email").val();
	var m_pass = $("#pass").val();
	var m_confirmPass = $("#passConfirm").val();
	if(errorType == 1)
	{
		if(m_uname == "")
		{
			$("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
			$("#RegisterMessageUserName").show();
			setTimeout(function(){
			$("#RegisterMessageUserName").hide();
			},3000);
		}
	}
	else if(errorType ==2){
		if(m_uname == "")
		{
			$("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
			$("#RegisterMessageUserName").show();
			setTimeout(function(){
			$("#RegisterMessageUserName").hide();
			},3000);
		}
		if(m_email == "")
		{
			$("#RegisterMessageEmail").html("لطفا پست الکترونیکی را وارد کنید.");
			$("#RegisterMessageEmail").show();
			setTimeout(function(){
				$("#RegisterMessageEmail").hide();
			},3000);
		}
		else if(validEmail(m_email) == false) 
	 	{
			
			$("#RegisterMessageEmail").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
			$("#RegisterMessageEmail").show();
			setTimeout(function(){
				$("#RegisterMessageEmail").hide();
			},3000);
		}
	}
	else if(errorType ==3)
	{
		if(m_uname == "")
		{
			$("#RegisterMessageUserName").html("نام کاربری را وارد کنید.");
			$("#RegisterMessageUserName").show();
			setTimeout(function(){
			$("#RegisterMessageUserName").hide();
			},3000);
		}
		if(m_email == "")
		{
			$("#RegisterMessageEmail").html("لطفا پست الکترونیکی را وارد کنید.");
			$("#RegisterMessageEmail").show();
			setTimeout(function(){
				$("#RegisterMessageEmail").hide();
			},3000);
		}
		else if(validEmail(m_email) == false) 
	 	{
			
			$("#RegisterMessageEmail").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
			$("#RegisterMessageEmail").show();
			setTimeout(function(){
				$("#RegisterMessageEmail").hide();
			},3000);
		}
		if(m_pass == "")
		{
			$("#RegisterMessagePass").html("لطفا کلمه عبور را وارد کنید.");
			$("#RegisterMessagePass").show();
			setTimeout(function(){
				$("#RegisterMessagePass").hide();
			},3000);
		}
	}
	
	$("#RegisterMessage").html(message);
	$("#RegisterMessage").show();
	setTimeout(function(){
		$("#RegisterMessage").hide();
		},3000);
}

var userName = "";
function DetectLoggedInUser()
{
		$("#LoginModal").css("display","none");
	$("#login-box").hide();
	$("#RegisterBox").hide();
	$("#LogInDetails").hide();
	$("#LoginMessage").hide();
	$("#LogInDetails").hide();
			
	 $.getJSON(ServerURL + "Account/IsLoggedIn", {}, function (result) {
        if (result.Status == true) {
            userName = result.user;
			$("#LogInDetails").show();
            $("#LogInDetailsUserName").html(result.user);
			$("#login-box").hide();
			$("#RegisterBox").hide();
			$("#UserInfo").show();
            $("#UserName").html(result.user);
			$("#Login").hide();
        } else {
            $("#login-box").show();
			$("#RegisterBox").hide();
			$("#LogInDetails").hide();
			$("#LoginMessage").hide();
			$("#LogInDetails").hide();
			$("#UserInfo").hide();
			$("#Login").show();
        }
    });
}

function GoToPanel()
{
	if(userName != ""){
		window.location = "Panels/blank.html";
	}
	else{
		DetectLoggedInUser();
	}
}

function LogOut()
{
	 $.getJSON(ServerURL + "Account/LogOutOfServer", {}, function (result) {
		userName = "";
		$("#username").val("");
		$("#password").val("");
		$("#login-box").show();
		$("#LoginButton").show();
		$("#RegisterBox").hide();
		$("#LogInDetails").hide();
		$("#LoginMessage").hide();
         $("#UserInfo").hide();
         $("#UserName").html(result.user);
         $("#Login").show();
    });
}


function SubscribeToNewspaper()
{
	var email = $('#NewspaperEmail').val();
	if(email == "")
	{
		SubscribeMessages("لطفا پست الکترونیکی را  وارد کنید.");
	}
	else if(validEmail(email) == false) {
		SubscribeMessages("لطفا پست الکترونیکی را صحیح وارد کنید.");
	}
	else
	{
		$.getJSON(ServerURL + "Utility/NewspaperSubscribe", 
		{
			email : email
			},
			function(result)
			{
				if(result.Status == true)
				{
					SubscribeMessages("درخواست شما با موفقیت ثبت گردید");
					$("#NewspaperEmail").val("آدرس پست الکترونیکی شما");
				}
				else
				{
					if(result.Message.indexOf("Exist") != -1)
					{
						SubscribeMessages("پست الکترونیکی قبلا در سیستم ثبت شده است.");
					}
					else
					{
						SubscribeMessages("امکان ثبت درخواست وجود ندارد. دقایقی دیگر مجددا تلاش کنید");
					}
				}
			}
			);
	}
}

function SubscribeMessages(msg)
{
	$("#NewspaperEmailError").html(msg);
	$("#NewspaperEmailError").fadeIn(1000);
	setTimeout(function(){
		$("#NewspaperEmailError").fadeOut(1000);
		}, 5000);
}

function ShowAnnounceRequestForm()
{
	$("#AnnounceSeminar").hide();
	$("#RequestForAnnounce").fadeIn();
}

function SubmitRequestForAnnounce()
{
	var email = $("#RequestForSeminarEmail").val();
	if(email == ""){
		$("#RequestForSeminarError").html("لطفا پست الکترونیکی را  وارد کنید.");
		$("#RequestForSeminarError").show();
		setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
	}
	else if(validEmail(email) == false){
		$("#RequestForSeminarError").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
		$("#RequestForSeminarError").show();
		setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
	}
	else{
//		RequestForParticipateInTest
		$.getJSON(ServerURL + "Session/RequestToParticipate", 
		{
			sessionId : 36,
			email : email
			},
			function(result)
			{
				if(result.Status == true){
					$("#RequestForSeminarError").html("درخواست شما با موفقیت ثبت گردید و شماره پیگیری شما " + result.Result.followUpCode + "می باشد.");
					$("#RequestForSeminarError").show();
					setTimeout(function(){
						$("#RequestForSeminarError").hide();
						{//TODO: CHeck If Is Visible 	
							RequestForSeminarCancel();
						}
					}, 10000);
				}
				else{
					if(result.Message.indexOf("Exist") != -1){
						$("#RequestForSeminarError").html("درخواستی با این پست الکترونیکی قبلا ثبت شده است!");
						$("#RequestForSeminarError").show();
						setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
					}
					else{
						$("#RequestForSeminarError").html("امکان ثبت درخواست وجود ندارد، دقایقی دیگر مجددا تلاش نمایید.");
						$("#RequestForSeminarError").show();
						setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
					}
				}
			});
	}
}

function RequestForSeminarCancel()
{
	$("#RequestForAnnounce").hide();
	$("#AnnounceSeminar").fadeIn();
}

function ForgetPassword()
{
	var m_email = $("#forgetEmail").val();
	if(m_email == ""){
		$("#ForgetPassMessage").html("لطفا پست الکترونیکی را  وارد کنید.");
		$("#ForgetPassMessage").show();
		setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
	}
	else if(validEmail(m_email) == false){
		$("#ForgetPassMessage").html("لطفا پست الکترونیکی را صحیح وارد کنید.");
		$("#ForgetPassMessage").show();
		setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
	}
	else{
		$("#ForgetPassMessage").html("در حال ارسال....");
		$("#ForgetPassMessage").show();
		$("input[name=forgetPassBtn]").hide();
		$("label[name=forgetPassBtn]").hide();
		

		$.getJSON(ServerURL + "Account/ForgetPassword", 
		{
			email : m_email
			},
			function(result)
			{
				if(result.Status == true){
					$('#ForgetPassMessage').removeClass("ErrorLink");
					$('#ForgetPassMessage').addClass("SuccessLink");
					$("#ForgetPassMessage").html("درخواست شما با موفقیت ثبت گردید و پیامی به پست الکترونیکی شما ارسال شده است. لطفا به پست الکترونیکی خود مراجعه فرمایید. ");
					$("#ForgetPassMessage").show();
				}
				else{
					if(result.Message.indexOf("registered") != -1){
						$("#ForgetPassMessage").html("این پست الکترونیکی در سامانه موجود نیست");
						$("#ForgetPassMessage").show();
						setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
						$("input[name=forgetPassBtn]").show();
					}
					else{
						$("#ForgetPassMessage").html(result.Message);// "امکان ثبت درخواست وجود ندارد، دقایقی دیگر مجددا تلاش نمایید.");
						$("#ForgetPassMessage").show();
						setTimeout(function(){$("#RequestForSeminarError").hide();}, 5000);
						$("input[name=forgetPassBtn]").show();
					}
				}
			});
	}
	
	
}