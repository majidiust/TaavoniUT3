//Region : Global Variables
var selectedProject;
var currentProjectStep = 0;
var numberOfUsedUnit = 0;
var numberOfUsedParking = 0;
//Region : Functions
function Debug(message) {
    console.log(message);
}

function GetListOfProjects() {
    GetProjectsFromServer();
}

function ShowNewProject() {
    selectedProject = -1;
    Debug("ShowNewProject");
    ClearProject();
    currentProjectStep = 0;
    GotoProjectWizard(1);
    ShowBox("#NewProject");
}


function ClearProjectForm() {
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


function ClearProject(){
    ClearProjectForm();
    listOfMoshaat.splice(0,listOfMoshaat.length);
    listOfVaheds.splice(0, listOfVaheds.length);
    numberOfUsedParking = 0;
    numberOfUsedUnit = 0;
    ClearMoshaatForm();
    ClearVahedForm();
}

function CheckProjectStep1Values() {
    var name = $("#NewProjectName").val();
    var address = $("#NewProjectAddress").val();
    if (name == "") {
        CustomAlert('توجه', " نام پروژه جدید را وارد نمایید.", null);
        return false;
    }
    if (address == "") {
        CustomAlert('توجه', " آدرس پروژه جدید را وارد نمایید.", null);
        return false;
    }
    return true;
}

function CheckProjectStep2Values() {
    var mofid = $("#NewProjectBanaieMofid").val();
    var moshaat = $("#NewProjectMizanMoshaat").val();
    var tedadVahed = $("#NewProjectTedadvahed").val();
    var tedadParking = $("#NewProjectTedadParking").val();
    if (mofid == "") {
        CustomAlert('توجه', " بنای مفید پروژه جدید را وارد نمایید.", null);
        return false;
    }
    if (moshaat == "") {
        CustomAlert('توجه', " مشاعات  پروژه جدید را وارد نمایید.", null);
        return false;
    }
    if (tedadVahed == "") {
        CustomAlert('توجه', " تعداد واحد پروژه جدید را وارد نمایید.", null);
        return false;
    }
    if (tedadParking == "") {
        CustomAlert('توجه', " تعداد پارکینگ پروژه جدید را وارد نمایید.", null);
        return false;
    }

    $("#rTotalProjectUnit").html(tedadVahed);
    $("#rTotalProjectParking").html(tedadParking);
    $("#rAddedProjectParking").html(numberOfUsedParking);
    $("#rAddedProjectUnit").html(numberOfUsedUnit);

    return true;
}

function ClearMoshaatForm() {
    $("#NewMoshaatName").val('');
    $("#NewMoshaatMetraj").val('');
}

function ClearVahedForm() {
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
    var lastIndex = 0;
    if (listOfMoshaat.length > 0)
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
        Debug(listOfMoshaat);
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
    var lastIndex = 0;
    if (listOfVaheds.length > 0)
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
        NewVahedCount: $("#NewVahedCount").val(),
        NewVahedIndex: lastIndex
    }

    var hasError = false;
    if (newVahed.NewVahedMetraj == "") {
        haeError = true;
        CustomModalAlert("خطا", "لطفا متراژ واحد را وارد نمایید", null);
    } else if (newVahed.NewVahedTeras == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت تراس را وارد نمایید", null);
    } else if (newVahed.NewVahedAnbarMetraj == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا متراژ انبار را وارد نمایید", null);
    } else if (newVahed.NewVahedInternalAnbarMetraj == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا متراژ انبار داخلی را وارد نمایید", null);
    } else if (newVahed.NewVahedParking == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت پارکینگ را وارد نمایید", null);
    } else if (newVahed.NewVahedPosition == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا موقعیت جغرافیایی را وارد نمایید", null);
    } else if (newVahed.NewVahedGreenLoby == "") {
        hasError = true;
        CustomModalAlert("خطا", "لطفا وضعیت لابی سبز را وارد نمایید", null);
    }
    else if (newVahed.NewVahedCount == "") {
        hasError = true;
        CustomModalAlert("خطا", "طفا تعداد این واحد را وارد نمایید", null);
    }
    if (hasError == false) {
        numberOfUsedParking += parseInt(newVahed.NewVahedParking);
        numberOfUsedUnit += parseInt(newVahed.NewVahedCount)
        $("#rAddedProjectParking").html(numberOfUsedParking);
        $("#rAddedProjectUnit").html(numberOfUsedUnit);
        listOfVaheds.push(newVahed);
        Debug(listOfVaheds);
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
        row += "<td>" + newVahed.NewVahedCount + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteVahed(' + "'" + newVahed.NewVahedIndex + "'" + ');"> حذف </button>';
        row += '<button  style="width:100%" class="btn btn-large btn-warning" onclick="ShowPaymentSchedule(' + "'" + newVahed.NewVahedIndex + "'" + ')"> رژیم پرداخت </button>';
        row += '</td></tr>';
        Debug(row);
        return row;
    } else return null;
}

function GotoProjectWizard(step) {
    Debug("GotoProjectWizard");

    var _hasError = false;
    var _doOrdinary = true;
    if (currentProjectStep < step) {
        if (step == 2) {
            if (CheckProjectStep1Values() == false) {
                _hasError = true;
            }
            else {
                Debug("No Error");
                _hasError = false;
                currentStep = 2;
                _doOrdinary = true;
            }
        }
        else if (step == 3) {
            if (CheckProjectStep2Values() == false) {
                _hasError = true;
            }
            else {
                _hasError = false;
                currentStep = 3;
                _doOrdinary = true;
            }
        }
        else if(step == 5){
            SaveProjectToServer();
        }
    }

    if (_doOrdinary == true && _hasError == false) {
        Debug("Ordinary Bihavour");
        $("div[name=memberWizard]").hide();
        Debug("#NewProjectWizard" + step);
        $("#NewProjectWizard" + step).show();
    }
}


function ShowNewMoshaatForm() {
    $('#NewMoshaat').modal('show');
}

function ShowNewVahedsForm() {
    $('#NewVahed').modal('show');
}

function DeleteMoshaat(index) {
    Debug("Try to delete : " + index);
    Debug(listOfMoshaat);
    for (var i = 0; i < listOfMoshaat.length; i++) {
        if (listOfMoshaat[i].newMoshaatIndex == index) {
            listOfMoshaat = listOfMoshaat.splice(i, 0);
            break;
        }
    }
    removeProjectShare(selectedProject, index);
    Debug(listOfMoshaat);
}

function DeleteVahed(index) {
    Debug("Try to delete : " + index);
    Debug(listOfVaheds);
    for (var i = 0; i < listOfVaheds.length; i++) {
        if (listOfVaheds[i].NewVahedIndex == index) {
             numberOfUsedParking -= parseInt(listOfVaheds[i].NewVahedParking);
            numberOfUsedUnit -= parseInt(listOfVaheds[i].NewVahedCount)
                $("#rAddedProjectParking").html(numberOfUsedParking);
        $("#rAddedProjectUnit").html(numberOfUsedUnit);
            listOfVaheds = listOfVaheds.splice(i, 0);
            break;
        }
    }

    removeProjectUnit(selectedProject, index);
    Debug(listOfVaheds);
}

function GetProjectsFromServer(){
    $("#ListOfProjectsTable tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
    CustomBlockingPanel('توجه', 'در حال دریافت لیست پروژه ها ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetListOfProjects",
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
            for (var i = 0; i < result.Projects.length; i++) {
                var row = "<tr>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectId + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectName + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectUsefullEnv + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectUnits + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectNumberOfParking + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectShare + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectBeginDate + "</td>";
                row += "<td style='direction:rtl;'>" + result.Projects[i].ProjectEndDate + "</td>";
                row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="ShowProjectDetails(' + "'" + result.Projects[i].ProjectId + "'" + ');"> جزییات </button>';
                row += '</td></tr>';
                $("#ListOfProjectsTable").append(row);
            }
            console.log(result);
            ShowBox("#ListOfProjects");
        }
    });
}

function SaveProjectToServer() {
    var newProject = {
        projectName: $("#NewProjectName").val(),
        address: $("#NewProjectAddress").val(),
        beginDate: $("#NewProjectBeginDateDay").val() + "-" + $("#NewProjectBeginDateMonth").val() + "-" + $("#NewProjectBeginDateYear").val(),
        endDate: $("#NewProjectEndDateDay").val() + "-" + $("#NewProjectEndDateMonth").val() + "-" + $("#NewProjectEndDateYear").val(),
        usefull: $("#NewProjectBanaieMofid").val(),
        share: $("#NewProjectMizanMoshaat").val(),
        nou: $("#NewProjectTedadvahed").val(),
        nop: $("#NewProjectTedadParking").val()
    };
    Debug(newProject);
    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/CreateProject",
        
        dataType: 'json',
        data: newProject,
        success: function (result) {
            Debug(" $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ");
            Debug(listOfMoshaat);
            Debug(listOfVaheds);
            if (result.Status == true) {

                var pId = result.projectId;
                for (var i = 0; i < listOfMoshaat.length; i++) {
                    var newMoshaat = {
                        projectId: pId,
                        id: listOfMoshaat[i].newMoshaatIndex,
                        name: listOfMoshaat[i].NewMoshaatName,
                        value: listOfMoshaat[i].NewMoshaatMetraj
                    }
                    $.ajax({
                        type: 'POST',
                        url: ServerURL + "Account/AddShareToProject",
                        dataType: 'json',
                        data: newMoshaat,
                        async: false
                    });
                }
                for (var i = 0; i < listOfVaheds.length; i++) {
                    var newUnit = {
                        projectId: pId,
                        unitId: listOfVaheds[i].NewVahedIndex,
                        value: listOfVaheds[i].NewVahedMetraj,
                        trus: listOfVaheds[i].NewVahedTeras,
                        wareHouseValue: listOfVaheds[i].NewVahedAnbarMetraj,
                        internalWareHouse: listOfVaheds[i].NewVahedInternalAnbarMetraj,
                        Parking: listOfVaheds[i].NewVahedParking,
                        Location: listOfVaheds[i].NewVahedPosition,
                        greenloby: listOfVaheds[i].NewVahedGreenLoby,
                        nob: listOfVaheds[i].NewVahedNumberOfBedRooms,
                        quantity: listOfVaheds[i].NewVahedCount
                    }

                    $.ajax({
                        type: 'POST',
                        url: ServerURL + "Account/AddUnitToProject",
                        dataType: 'json',
                        data: newUnit,
                        async: false
                    });
                }
               // ClearProject();
                GotoProjectWizard(6);
            }
            else {
                GotoProjectWizard(7);
            }
            Debug(result.Message);
        },
        error: function () {
            GotoProjectWizard(7);
        },
        async: true
    });
}

function ShowProjectDetails(projectId){
    selectedProject = projectId;
    ClearProjectDetails();
    CustomBlockingPanel('توجه', 'در حال دریافت اطلاعات پروژه ...', -1, null);
    $.ajax({
        type: 'GET',
        url: ServerURL + "Account/GetProjectInfo",
        data: { projectId: projectId },
        dataType: 'json',
        success: function (result) {
            CustomBlockingPanel('توجه', 'داده ها با موفقیت بازیابی شدند.', 500, null);
            $("#ProjectName").val(result.project.ProjectName);
            $("#ProjectAddress").val(result.project.ProjectAddress);
            $("#ProjectBanaieMofid").val(result.project.ProjectUsefullEnv);
            $("#ProjectMizanMoshaat").val(result.project.ProjectShare);
            $("#ProjectTedadvahed").val(result.project.ProjectUnits);
            $("#ProjectTedadParking").val(result.project.ProjectNumberOfParking ? result.project.ProjectNumberOfParking : "0");
            $("#ProjectCode").val(result.project.ProjectId);
            for (var i = 0; i < result.shares.length; i++) {
                var newMoshaat = {
                    NewMoshaatName: result.shares[i].ShareName,
                    NewMoshaatMetraj: result.shares[i].ShareValue,
                    newMoshaatIndex: result.shares[i].ShareId
                }
                listOfMoshaat.push(newMoshaat);
            }

            for (var i = 0; i < result.units.length; i++) {
                var newVahed = {
                    NewVahedMetraj: result.units[i].UnitValue,
                    NewVahedTeras: result.units[i].UnitTrus,
                    NewVahedAnbarMetraj: result.units[i].UnitWareHousValue,
                    NewVahedInternalAnbarMetraj: result.units[i].UnitInternalWareHouseValue,
                    NewVahedParking: result.units[i].UnitParking,
                    NewVahedPosition: result.units[i].UnitLocation,
                    NewVahedGreenLoby: result.units[i].UnitGreenLoby,
                    NewVahedNumberOfBedRooms: result.units[i].UnitNumberOfBeds,
                    NewVahedCount: result.units[i].UnitCount,
                    NewVahedIndex: result.units[i].UnitId
                }
                listOfVaheds.push(newVahed);
            }
            console.log(result);

            renderListOfMoshaat();
            renderListOfVahed();
            ShowBox("#ProjectDetails");
        }
    });

}

function ClearProjectDetails(){
    ClearProject();

        $("#ProjectMoshaat tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });
            $("#ProjectVaheds tbody tr").each(function () {
        this.parentNode.removeChild(this);
    });

     $("#ProjectName").val("");
            $("#ProjectAddress").val("");
            $("#ProjectBanaieMofid").val("");
            $("#ProjectMizanMoshaat").val("");
            $("#ProjectTedadvahed").val("");
            $("#ProjectTedadParking").val("");
            $("#ProjectCode").val("");
}

function renderListOfVahed(){
    for(var i = 0 ; i < listOfVaheds.length; i++){
        var newVahed = listOfVaheds[i];
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
        row += "<td>" + newVahed.NewVahedCount + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteVahed(' + "'" + newVahed.NewVahedIndex + "'" + ');"> حذف </button>';
        row += '<button  style="width:100%" class="btn btn-large btn-warning" onclick="ShowPaymentSchedule(' + "'" + newVahed.NewVahedIndex + "'" + ')"> رژیم پرداخت </button>';
        row += '</td></tr>';
        $("#ProjectVaheds").append(row);
    }
}


function renderListOfMoshaat(){
    for(var i = 0 ; i < listOfMoshaat.length ; i++){
        var newMoshaat = listOfMoshaat[i];
         var row = "<tr>";
        row += "<td>" + newMoshaat.newMoshaatIndex + "</td>";
        row += "<td>" + newMoshaat.NewMoshaatName + "</td>";
        row += "<td>" + newMoshaat.NewMoshaatMetraj + "</td>";
        row += '<td><button  style="width:100%" class="btn btn-large btn-error" onclick="$(this).parent().parent().remove();DeleteMoshaat(' + "'" + newMoshaat.newMoshaatIndex + "'" + ');"> حذف </button></td></tr>';
        console.log(row);
        $("#ProjectMoshaat").append(row);
    }    
}

function removeProjectUnit(projectId, unitId){
    $.ajax({
        type: 'POST',
        url: ServerURL + "Account/RemoveProjectUnit",
        data: { projectId: projectId, UnitId: unitId },
        dataType: 'json',
        success: function (result) {
            if (result.Status == false) {
                alert("این واحد به کاربری یا کاربرانی اختصاص داده شده است. لطفا ابتدا واحد را آزاد کرده و سپس اقدام نمایید.");
            }
        }
    });
}

function removeProjectShare(projectId, sharedId){
        $.ajax({
        type: 'POST',
        url: ServerURL + "Account/RemoveProjectShare",
        data: { projectId: projectId, ShareId: sharedId },
        dataType: 'json',
        success: function (result) {
            if (result.Status == false) {
                alert("این واحد به کاربری یا کاربرانی اختصاص داده شده است. لطفا ابتدا واحد را آزاد کرده و سپس اقدام نمایید.");
            }
        }
    });
}