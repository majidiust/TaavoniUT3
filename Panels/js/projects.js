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

function ClearMoshaatForm(){
        $("#NewMoshaatName").val('');
        $("#NewMoshaatMetraj").val('');
}

function ClearVahedForm(){
    $("#NewVahedMetraj").val('');
    $("#NewVahedTeras").val('');
    $("#NewVahedAnbarMetraj").val('');
    $("#NewVahedInternalAnbarMetraj").val('');
    $("#NewVahedParking").val('');
    $("#NewVahedPosition").val('');
    $("#NewVahedGreenLoby").val('');
    $("#NewVahedNumberOfBedRooms").val('');
}


function AddNewMoshaat() {

    Debug(listOfMoshaat);
    var lastIndex = 0 ;
    if(listOfMoshaat.length > 0)
        lastIndex = listOfMoshaat[listOfMoshaat.length - 1].newMoshaatIndex + 1;

    var newMoshaat = {
        NewMoshaatName: $("#NewMoshaatName").val(),
        NewMoshaatMetraj: $("#NewMoshaatMetraj").val(),
        newMoshaatIndex: lastIndex
    }

    var hasError = false;
    if (newMoshaat.NewMoshaatName == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا نام را وارد نمایید", null);
    } else if (newMoshaat.NewMoshaatMetraj == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا متراژ را وارد نمایید", null);
    }
    if (hasError == false) {
        listOfMoshaat.push(newMoshaat);
        var row = "<tr>";
        row += "<td>" + newMoshaat.newMoshaatIndex + "</td>";
        row += "<td>" + newMoshaat.NewMoshaatName + "</td>";
        row += "<td>" + newMoshaat.NewMoshaatMetraj + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteMoshaat(' + "'" + newMoshaat.newMoshaatIndex + "'" + ');"> حذف </button></td></tr>';
        Debug(row);
        return row;
    } else return null;
}

function AddNewVahed() {

    Debug(listOfVaheds);
    var lastIndex = 0 ;
    if(listOfVaheds.length > 0)
        lastIndex = listOfVaheds[listOfVaheds.length - 1].NewVahedIndex + 1;

    var newVahed = {
        NewVahedMetraj: $("#NewVahedMetraj").val(),
        NewVahedTeras: $("#NewVahedTeras").val(),
        NewVahedAnbarMetraj: $("#NewVahedAnbarMetraj").val(),
        NewVahedInternalAnbarMetraj: $("#NewVahedInternalAnbarMetraj").val(),
        NewVahedParking: $("#NewVahedParking").val(),
        NewVahedPosition: $("#NewVahedPosition").val(),
        NewVahedGreenLoby: $("#NewVahedGreenLoby").val(),
        NewVahedNumberOfBedRooms: $("#NewVahedNumberOfBedRooms").val(),
        NewVahedIndex: lastIndex
    }

    var hasError = false;
    if (newVahed.NewVahedMetraj == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا متراژ واحد را وارد نمایید", null);
    }else if (newVahed.NewVahedTeras == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت تراس را وارد نمایید", null);
    }else if (newVahed.NewVahedAnbarMetraj == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا متراژ انبار را وارد نمایید", null);
    }else if (newVahed.NewVahedInternalAnbarMetraj == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا متراژ انبار داخلی را وارد نمایید", null);
    }else if (newVahed.NewVahedParking == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت پارکینگ را وارد نمایید", null);
    }else if (newVahed.NewVahedPosition == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا موقعیت جغرافیایی را وارد نمایید", null);
    }else if (newVahed.NewVahedGreenLoby == 0) {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت لابی سبز را وارد نمایید", null);
    }
    if (hasError == false) {
        listOfVaheds.push(newVahed);
        var row = "<tr>";
        row += "<td>" + newVahed.NewVahedIndex + "</td>";
        row += "<td>" + newVahed.NewVahedMetraj + "</td>";
        row += "<td>" + newVahed.NewVahedTeras + "</td>";
        row += "<td>" + newVahed.NewVahedAnbarMetraj + "</td>";
        row += "<td>" + newVahed.NewVahedInternalAnbarMetraj + "</td>";
        row += "<td>" + newVahed.NewVahedParking + "</td>";
        row += "<td>" + newVahed.NewVahedPosition + "</td>";
        row += "<td>" + newVahed.NewVahedGreenLoby + "</td>";
        row += "<td>" + newVahed.NewVahedNumberOfBedRooms + "</td>";

        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteVahed(' + "'" + newVahed.NewVahedIndex + "'" + ');"> حذف </button></td></tr>';
        Debug(row);
        return row;
    } else return null;
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
    $('#NewMoshaat').modal('show');
}

function ShowNewVahedsForm()
{
    $('#NewVahed').modal('show');
}

function DeleteMoshaat(index){
    Debug("Try to delete : " + index);
    Debug(listOfMoshaat);
    for(var i = 0 ; i < listOfMoshaat.length ; i++){
        if(listOfMoshaat[i].newMoshaatIndex == index){
            listOfMoshaat = listOfMoshaat.splice(i, 0);
            break;
        }
    }
    Debug(listOfMoshaat);
}

function DeleteVahed(index){
    Debug("Try to delete : " + index);
    Debug(listOfVaheds);
    for(var i = 0 ; i < listOfVaheds.length ; i++){
        if(listOfVaheds[i].NewVahedIndex == index){
            listOfVaheds = listOfVaheds.splice(i, 0);
            break;
        }
    }
    Debug(listOfVaheds);
}