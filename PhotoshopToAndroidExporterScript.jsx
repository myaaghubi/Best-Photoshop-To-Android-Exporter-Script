/*
	*** Author: Mohammad Yaghobi (https://github.com/mohammadyaghobi)
*/

var targetImageTypes = [
{
	name: "Free size drawable(target mdpi width=free)",
	mdpi: 1
},
{
	name: "Launcher icons(standard icons - target mdpi width=48px)",
	mdpi: 48
},
{
	name: "Action bar, Dialog & Tab icons(target mdpi width=32px)",
	mdpi: 32
},
{
	name: "Small Contextual Icons(target mdpi width=16px)",
	mdpi: 16
},
{
	name: "Notification icons(target mdpi width=24px)",
	mdpi: 24
}
];

var targetSuffixs = [
{
	name: "ldpi",
	multiplayer: 0.75
},
{
	name: "mdpi",
	multiplayer: 1
},
{
	name: "hdpi",
	multiplayer: 1.5
},
{
	name: "xhdpi",
	multiplayer: 2
},
{
	name: "xxhdpi",
	multiplayer: 3
},
{
	name: "xxxhdpi",
	multiplayer: 4
}
];

var targetAddress = [
{
	name: "Mipmap",
	address: "mipmap-"
},
{
	name: "Drawable",
	address: "drawable-"
}
];

var document = app.activeDocument;
var width = document.width;
var targetFolder;

var selectedImageTypes = {};
var selectedSuffixs = {};
var selectedAddress = {};


// variables



var ru = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;    

try{
	var rootDoc = app.activeDocument, activeLayer = rootDoc.activeLayer, activeLayer2, docName = rootDoc.name, docPath = rootDoc.path;
	showOptionsPanel();
}
catch(error){
	alert("First save your document.");
}

app.preferences.rulerUnits = ru;


function showOptionsPanel(){
	var primeWin = new Window("dialog","Export options");
    var veiwGroup = primeWin.add("group");

    var targetImageTypesBox = createOneItemSelectionPanel0(targetImageTypes, veiwGroup);
    var targetSuffixsBox = createMultiSelectionPanel1(targetSuffixs, veiwGroup);
    var targetAddressBox = createOneItemSelectionPanel2(targetAddress, veiwGroup);

    var btnGroup = primeWin.add("group");
    var ok_ = btnGroup.add("button", undefined, "Export");
    var cancel_ = btnGroup.add("button", undefined, "Cancel");
    
    ok_.onClick = function() {
		targetFolder = Folder.selectDialog("Select target folder to export");
		if (targetFolder) {
			var iconType;
			for (var key in selectedImageTypes) {
				if (selectedImageTypes.hasOwnProperty(key)) {
					iconType = selectedImageTypes[key];
				}
			}
			var targetaddress;
			for (var key in selectedAddress) {
				if (selectedAddress.hasOwnProperty(key)) {
					targetaddress = selectedAddress[key];
				}
			}
			for (var key in selectedSuffixs) {
				if (selectedSuffixs.hasOwnProperty(key)) {
					var item = selectedSuffixs[key];
					
					makeOutPut(item.multiplayer, iconType.mdpi, item.name, targetaddress.address);
				}
			}
			this.parent.parent.close();
		}
		else alert("Selected target folder is not valid!");
    };
    
    cancel_.onClick = function () {
        this.parent.parent.close();
    };

    primeWin.show();
}


function makeOutPut(multiplayer, mdpi, suffix, resAddress) {
	var calcWidth  = app.activeDocument.width,
	calcHeight = app.activeDocument.height;
	
	duplicateFile(calcWidth, calcHeight, multiplayer);
	var tempDoc = app.activeDocument;
	
	resizeDoc(calcWidth, mdpi, multiplayer);

	var tempDocName = tempDoc.name.replace(/\.[^\.]+$/, ''), docFolder = Folder(targetFolder.fsName + "/" + resAddress + suffix);

	if(!docFolder.exists) {
		docFolder.create();
	}

	var saveFile = File(docFolder + "/" + tempDocName + ".png");

	var sfwOptions = new ExportOptionsSaveForWeb(); 
	sfwOptions.format = SaveDocumentType.PNG; 
	sfwOptions.includeProfile = false; 
	sfwOptions.interlaced = 0; 
	sfwOptions.optimized = true; 
	sfwOptions.quality = 100;
	sfwOptions.PNG8 = false;

	activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function createOneItemSelectionPanel0(array, parent) {
    var panel = parent.add("panel", undefined, "Image type");
	panel.alignment = "top";
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("radiobutton", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
		if (i==0) {
			cb.value = true;
			selectedImageTypes[cb.item.name] = cb.item;
		}
        cb.onClick = function() {
            if(this.value) {
                selectedImageTypes[this.item.name] = this.item;
            } else {
                delete selectedImageTypes[this.item.name];
            }
        };
    }
};
function createMultiSelectionPanel1(array, parent) {
    var panel = parent.add("panel", undefined, "Icon sizes");
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
		if (i>0 && i<6) {
			cb.value = true;
			selectedSuffixs[cb.item.name] = cb.item;
		}
        cb.onClick = function() {
            if(this.value) {
                selectedSuffixs[this.item.name] = this.item;
            } else {
                delete selectedSuffixs[this.item.name];
            }
        };
    }
};
function createOneItemSelectionPanel2(array, parent) {
    var panel = parent.add("panel", undefined, "Target type");
	panel.alignment = "top";
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("radiobutton", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
		if (i==1) {
			cb.value = true;
			selectedAddress[cb.item.name] = cb.item;
		}
        cb.onClick = function() {
            if(this.value) {
                selectedAddress[this.item.name] = this.item;
            } else {
                delete selectedAddress[this.item.name];
            }
        };
    }
};

function resizeDoc(width, mdpi, multiplayer) {
	var newWidth = 1;
	if (mdpi>1) {
		var imageBaseRateWidth = mdpi/width;
		newWidth = multiplayer*mdpi;
	} else {
		newWidth = multiplayer*width;
	}

	resizeLayer(newWidth);
	activeLayer2.merge();
}

// third party
function resizeLayer(newWidth) {
	var idImgS = charIDToTypeID( "ImgS" );
	var desc2 = new ActionDescriptor();
	var idWdth = charIDToTypeID( "Wdth" );
	var idPxl = charIDToTypeID( "#Pxl" );
	desc2.putUnitDouble( idWdth, idPxl, newWidth);
	var idscaleStyles = stringIDToTypeID( "scaleStyles" );
	desc2.putBoolean( idscaleStyles, true );
	var idCnsP = charIDToTypeID( "CnsP" );
	desc2.putBoolean( idCnsP, true );
	var idIntr = charIDToTypeID( "Intr" );
	var idIntp = charIDToTypeID( "Intp" );
	var idBcbc = charIDToTypeID( "Bcbc" );
	desc2.putEnumerated( idIntr, idIntp, idBcbc );
	executeAction( idImgS, desc2, DialogModes.NO );
}

function duplicateFile(width, height, multiplayer) {	
	var fileName = activeLayer.name.replace(/\.[^\.]+$/, '');
	var document = app.documents.add(width, height, rootDoc.resolution, fileName, NewDocumentMode.RGB,DocumentFill.TRANSPARENT);

	app.activeDocument = rootDoc;
	activeLayer.duplicate(document, ElementPlacement.INSIDE);
	app.activeDocument = document;
	activeLayer2 = document.activeLayer;
}