const $ = require("jquery");
const path = require("path");
const fs = require("fs");
require("child_process")
let myEditor, myMonaco;
$(document).ready(async function () {
    // alert("document loaded");
    myEditor = await createEditor();

    let src = process.cwd();
    //the src where node application is started
    let name = path.basename(src); //as only the start name is shown , not the full path.
    /*
    $("#tree").html(name);


    //now I want that I click on this firstTree,and it gives me its content, for that I used jQuery
    $("#tree").on("click",function(){
        let children = fs.readdirSync(src);
        // console.log(children);
        for(let i=0;i<children.length;i++){

        }
    })
    */

    let pObj = {
        id: src,
        parent: "#",
        text: name
    }
    let chArr = createChildNode(src);

    chArr.unshift(pObj);
    // console.log(chArr);

    // unshift helps in placing the element at first position and rest are later in array.
    $("#tree").jstree({
        "core": {
            // node create work in jstree only if this is true.
            "check_callback": true,
            "data": chArr
        },
    }).on("open_node.jstree", function (e, data) {
        // when a folder is opened, which has an arrow, or which has children
        // console.log("folder was opened");
        // but only main folder has this arrow, rest its folder chiildren doeesn't have
        // so we need to loop its children and if it is a directory, then i will give arrow to it 

        let children = data.node.children;
        for (let i = 0; i < children.length; i++) {
            //gcNode -> grandchildren
            let gcNodes = createChildNode(children[i]);
            for (let j = 0; j < gcNodes.length; j++) {
                //data array
                //now, it is giving double double 
                //so to avoid that 
                // console.log(children[i]);
                let isGCPresent = $("#tree").jstree(true).get_node(gcNodes[j].id);
                if (isGCPresent) {
                    return;
                }
                //now it will not give double double ans.
                $("#tree").jstree().create_node(children[i], gcNodes[j], "last")
                //last tells the order in which its subfolders will be added.
            }
        }

    }).on("select_node.jstree", function (e, data) {
        console.log("select event occured");
        let src = data.node.id; //as we have stored source in our id
        let isFile = fs.lstatSync(src).isFile();
        if (!isFile) {
            return;
        }
        
        setData(src);
        //step 3 -> set name on tab
        let fName = path.basename(src);
        createTab(src);
    })
    function createChildNode(src) {
        let isDirectory = fs.lstatSync(src).isDirectory();
        if (isDirectory == false) {
            return [];
        }
        let children = fs.readdirSync(src);
        let chArr = [];
        for (let i = 0; i < children.length; i++) {
            let cPath = path.join(src, children[i]);
            let chObj = {
                id: cPath,
                parent: src,
                text: children[i]
            }
            chArr.push(chObj);
        }
        return chArr;
    }

    function createEditor() {
        const path = require('path');
        // remove 1 (.) from here,
        const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
        const amdRequire = amdLoader.require;
        const amdDefine = amdLoader.require.define;


        amdRequire.config({
            // correct the url by removing 1 ., because we are on the same level
            baseUrl: './node_modules/monaco-editor/min'
        });

        // workaround monaco-css not understanding the environment
        self.module = undefined;
        return new Promise(function (resolve, reject) {
            // we get an instance of a new editor by this fn 
            amdRequire(['vs/editor/editor.main'], function () {
                // give your id where you want to add monaco editor.
                // if you want to use getElementById, then, don't push #.
                var editor = monaco.editor.create(document.querySelector('#code-editor'), {
                    value: [
                        'function x() {',
                        '\tconsole.log("Hello world!");',
                        '}'
                    ].join('\n'),
                    // formatting in our code editor will be on basis of javascript language
                    // e.g different colors for variables and functions -> this is formatting 
                    language: 'javascript'
                });
                // console.log("line number 130")
                myMonaco = monaco;
                // console.log(editor);
                // return editor;
                resolve(editor);
            });
        })
    }

    function createTab(src){
        let fName = path.basename(src);
        $(".tab-container").append(`
        <div class="tab"><span onclick=handle() id=${src}>${fName}</span>
        <i class="fas fa-times" onclick=handleClose(this) id=${src}></i>
        </div>`)
    }
    function handle()
        {
            console.log("Handled");
        }

    function handleClose(elem){
        //remove current tab 
        console.log(elem);
        $(elem).parent().remove();
        
        //set content of first tab
        // LRU cache implement -> to get things fast , those needed more frequently are stored here , e.g tabs
        // normally LRU cache is not used
        // but good to use here in this project
        let src = $($(".tab-container span")[0].attr("id"));
        if(src){
            //if it is not the last item, when we have some 
            setData(src);
        }
        console.log("closed");
    }

    function setData(src){
        let content = fs.readFileSync(src) + "";
        //show in editor 
        // $("#code-editor").html(content); -> wrong 
        // console.log(" content " + content); //when clicked on file.
        // console.log(myEditor);
        // to set some value in monaco editor
        //this is copied from Internet
        myEditor.getModel().setValue(content);
        // how to set value in monaco editor -> search it
        let ext = src.split(".").pop();
        // js and cpp are special cases , rest all the languages are of the same name as of extension.
        if(ext == "js"){
            ext = "javascript"
        }
        myMonaco.editor.setModelLanguage(myEditor.getModel(),ext);
    }

function handleClick()
{
    console.log("Handled");
}
})