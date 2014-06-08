//Region : Global Variables
var selectedProject ; 
var currentProjectStep = 0;
//Region : Functions
function Debug(message)
{
	console.log(message);
}

function GetListOfProjects()
{
}

function ShowNewProject()
{
	
	Debug("ShowNewProject");
	ClearProjectForm();
	currentProjectStep = 0;
    GotoProjectWizard(1);
	ShowBox("#NewProject");
}


function ClearProjectForm()
{
	Debug("ClearProjectForm");
	$("#NewProjectVaheds tbody tr").each(function () {
			this.parentNode.removeChild(this);
		});
	$("#NewProjectMoshaat tbody tr").each(function () {
			this.parentNode.removeChild(this);
		});

 $("#NewProjectName").val("");
 $("#NewProjectAddress").val("");
 $("#NewProjectBanaieMofid").val("");
 $("#NewProjectMizanMoshaat").val("");
 $("#NewProjectTedadvahed").val("");
}

function CheckProjectStep1Values()
{
	var name = $("#NewProjectName").val();
 	var address = $("#NewProjectAddress").val();
	if(name == "")
	{
		CustomAlert('توجه', " نام پروژه جدید را وارد نمایید.", null);
		return false;
	}
	if(address == "")
	{
		CustomAlert('توجه', " آدرس پروژه جدید را وارد نمایید.", null);
		return false;
	}
	return true;
}

function CheckProjectStep2Values()
{
	var mofid = $("#NewProjectBanaieMofid").val();
 	var moshaat = $("#NewProjectMizanMoshaat").val();
	var tedadVahed = $("#NewProjectTedadvahed").val();
	if(mofid == "")
	{
		CustomAlert('توجه', " بنای مفید پروژه جدید را وارد نمایید.", null);
		return false;
	}
	if(moshaat == "")
	{
		CustomAlert('توجه', " مشاعات  پروژه جدید را وارد نمایید.", null);
		return false;
	}
	if(tedadVahed == "")
	{
		CustomAlert('توجه', " تعداد واحد پروژه جدید را وارد نمایید.", null);
		return false;
	}
	return true;
}



function GotoProjectWizard(step)
{
	Debug("GotoProjectWizard");
	
	var _hasError = false;
	var _doOrdinary = true;
	if(currentProjectStep < step){
		if(step == 2){
			if(CheckProjectStep1Values() == false)
			{
				_hasError = true;
			}
			else {
				Debug("No Error");
				_hasError = false;
				currentStep = 2;
				_doOrdinary = true;
			}
		}
		else if(step == 3){
			if(CheckProjectStep2Values() == false){
				_hasError = true;
			}
			else{
				_hasError = false;
				currentStep = 3;
				_doOrdinary = true;
			}
		}
	}
	
	if(_doOrdinary == true && _hasError == false){
		Debug("Ordinary Bihavour");
		$("div[name=memberWizard]").hide();
		Debug("#NewProjectWizard" + step);
		$("#NewProjectWizard" + step).show();
	}
}


function ShowNewMoshaatForm()
{
}

function ShowNewVahedsForm()
{
}