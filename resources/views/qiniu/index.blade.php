<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>上传动画界面</title>

    <script src="{{asset('js/jquery.min.js?v=1')}}"></script>
    <script>var myjq=$.noConflict();</script>

    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Roboto', sans-serif;
            background: -webkit-linear-gradient(bottom, #4F6072, #8699AA);
            background: linear-gradient(to top, #4F6072, #8699AA);
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
        }

        .upload {
            position: relative;
            width: 400px;
            min-height: 445px;
            box-sizing: border-box;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            padding-bottom: 20px;
            background: #fff;
            -webkit-animation: fadeup .5s .5s ease both;
            animation: fadeup .5s .5s ease both;
            -webkit-transform: translateY(20px);
            transform: translateY(20px);
            opacity: 0;
        }
        .upload .upload-files header {
            background: #4db6ac;
            text-align: center;
        }
        .upload .upload-files header p {
            color: #fff;
            font-size: 40px;
            margin: 0;
            padding: 50px 0;
        }
        .upload .upload-files header p i {
            -webkit-transform: translateY(20px);
            transform: translateY(20px);
            opacity: 0;
            font-size: 30px;
            -webkit-animation: fadeup .5s 1s ease both;
            animation: fadeup .5s 1s ease both;
        }
        .upload .upload-files header p .up {
            font-weight: bold;
            -webkit-transform: translateX(-20px);
            transform: translateX(-20px);
            display: inline-block;
            opacity: 0;
            -webkit-animation: faderight .5s 1.5s ease both;
            animation: faderight .5s 1.5s ease both;
        }
        .upload .upload-files header p .load {
            display: inline-block;
            font-weight: 100;
            margin-left: -8px;
            -webkit-transform: translateX(-20px);
            transform: translateX(-20px);
            opacity: 0;
            -webkit-animation: faderight 1s 1.5s ease both;
            animation: faderight 1s 1.5s ease both;
        }
        .upload .upload-files .body {
            text-align: center;
            padding: 50px 0;
            padding-bottom: 30px;
        }
        .upload .upload-files .body.hidden {
            display: none;
        }
        .upload .upload-files .body input {
            visibility: hidden;
        }
        .upload .upload-files .body i {
            font-size: 65px;
            color: lightgray;
        }
        .upload .upload-files .body p {
            font-size: 14px;
            padding-top: 15px;
            line-height: 1.4;
        }
        .upload .upload-files .body p b,
        .upload .upload-files .body p a {
            color: #4db6ac;
        }
        .upload .upload-files .body.active {
            border: dashed 2px #4db6ac;
        }
        .upload .upload-files .body.active i {
            box-shadow: 0 0 0 -3px #fff, 0 0 0 lightgray, 0 0 0 -3px #fff, 0 0 0 lightgray;
            -webkit-animation: file .5s ease both;
            animation: file .5s ease both;
        }
        @-webkit-keyframes file {
            50% {
                box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray, -8px 8px 0 -3px #fff, -8px 8px 0 lightgray;
            }
            75%,
            100% {
                box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray, -16px 16px 0 -3px #fff, -16px 16px 0 lightgray;
            }
        }
        @keyframes file {
            50% {
                box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray, -8px 8px 0 -3px #fff, -8px 8px 0 lightgray;
            }
            75%,
            100% {
                box-shadow: -8px 8px 0 -3px #fff, -8px 8px 0 lightgray, -16px 16px 0 -3px #fff, -16px 16px 0 lightgray;
            }
        }
        .upload .upload-files .body.active .pointer-none {
            pointer-events: none;
        }
        .upload .upload-files footer {
            width: 100%;
            margin: 0 auto;
            height: 0;
        }
        .upload .upload-files footer .divider {
            margin: 0 auto;
            width: 0;
            border-top: solid 4px #46aba1;
            text-align: center;
            overflow: hidden;
            -webkit-transition: width .5s ease;
            transition: width .5s ease;
        }
        .upload .upload-files footer .divider span {
            display: inline-block;
            -webkit-transform: translateY(-25px);
            transform: translateY(-25px);
            font-size: 12px;
            padding-top: 8px;
        }
        .upload .upload-files footer.hasFiles {
            height: auto;
        }
        .upload .upload-files footer.hasFiles .divider {
            width: 100%;
        }
        .upload .upload-files footer.hasFiles .divider span {
            -webkit-transform: translateY(0);
            transform: translateY(0);
            -webkit-transition: -webkit-transform .5s .5s ease;
            transition: -webkit-transform .5s .5s ease;
            transition: transform .5s .5s ease;
            transition: transform .5s .5s ease, -webkit-transform .5s .5s ease;
        }
        .upload .upload-files footer .list-files {
            width: 320px;
            margin: 0 auto;
            margin-top: 15px;
            padding-left: 5px;
            text-align: center;
            overflow-x: hidden;
            overflow-y: auto;
            max-height: 210px;
        }
        .upload .upload-files footer .list-files::-webkit-scrollbar-track {
            background-color: rgba(211, 211, 211, 0.25);
        }
        .upload .upload-files footer .list-files::-webkit-scrollbar {
            width: 4px;
            background-color: rgba(211, 211, 211, 0.25);
        }
        .upload .upload-files footer .list-files::-webkit-scrollbar-thumb {
            background-color: rgba(77, 182, 172, 0.5);
        }
        .upload .upload-files footer .list-files .file {
            width: 300px;
            min-height: 50px;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: justify;
            -ms-flex-pack: justify;
            justify-content: space-between;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            opacity: 0;
            -webkit-animation: fade .35s ease both;
            animation: fade .35s ease both;
        }
        .upload .upload-files footer .list-files .file .name {
            font-size: 12px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            width: 80px;
            text-align: left;
        }
        .upload .upload-files footer .list-files .file .progress {
            width: 175px;
            height: 5px;
            border: solid 1px lightgray;
            border-radius: 2px;
            background: -webkit-linear-gradient(right, rgba(77, 182, 172, 0.2), rgba(77, 182, 172, 0.8)) no-repeat;
            background: linear-gradient(to left, rgba(77, 182, 172, 0.2), rgba(77, 182, 172, 0.8)) no-repeat;
            background-size: 100% 100%;
        }
        .upload .upload-files footer .list-files .file .progress.active {
            -webkit-animation: progress 30s linear;
            animation: progress 30s linear;
        }
        @-webkit-keyframes progress {
            from {
                background-size: 0 100%;
            }
            to {
                background-size: 100% 100%;
            }
        }
        @keyframes progress {
            from {
                background-size: 0 100%;
            }
            to {
                background-size: 100% 100%;
            }
        }
        .upload .upload-files footer .list-files .file .done {
            cursor: pointer;
            width: 40px;
            height: 40px;
            background: #4db6ac;
            border-radius: 50%;
            margin-left: -10px;
            -webkit-transform: scale(0);
            transform: scale(0);
            position: relative;
        }
        .upload .upload-files footer .list-files .file .done:before {
            content: "View";
            position: absolute;
            top: 0;
            left: -5px;
            font-size: 24px;
            opacity: 0;
        }
        .upload .upload-files footer .list-files .file .done:hover:before {
            -webkit-transition: all .25s ease;
            transition: all .25s ease;
            top: -30px;
            opacity: 1;
        }
        .upload .upload-files footer .list-files .file .done.anim {
            -webkit-animation: done1 .5s ease forwards;
            animation: done1 .5s ease forwards;
        }
        .upload .upload-files footer .list-files .file .done.anim #path {
            -webkit-animation: done2 2.5s .5s ease forwards;
            animation: done2 2.5s .5s ease forwards;
        }
        .upload .upload-files footer .list-files .file .done #path {
            stroke-dashoffset: 7387.59423828125;
            stroke-dasharray: 7387.59423828125 7387.59423828125;
            stroke: #fff;
            fill: transparent;
            stroke-width: 50px;
        }
        @-webkit-keyframes done2 {
            to {
                stroke-dashoffset: 0;
            }
        }
        @keyframes done2 {
            to {
                stroke-dashoffset: 0;
            }
        }
        @-webkit-keyframes done1 {
            50% {
                -webkit-transform: scale(0.5);
                transform: scale(0.5);
                opacity: 1;
            }
            80% {
                -webkit-transform: scale(0.25);
                transform: scale(0.25);
                opacity: 1;
            }
            100% {
                -webkit-transform: scale(0.5);
                transform: scale(0.5);
                opacity: 1;
            }
        }
        @keyframes done1 {
            50% {
                -webkit-transform: scale(0.5);
                transform: scale(0.5);
                opacity: 1;
            }
            80% {
                -webkit-transform: scale(0.25);
                transform: scale(0.25);
                opacity: 1;
            }
            100% {
                -webkit-transform: scale(0.5);
                transform: scale(0.5);
                opacity: 1;
            }
        }
        .upload .upload-files footer .importar {
            outline: none;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 20px;
            margin: auto;
            border: solid 1px #4db6ac;
            color: #4db6ac;
            background: transparent;
            padding: 8px 15px;
            font-size: 12px;
            border-radius: 4px;
            font-family: Roboto;
            line-height: 1;
            cursor: pointer;
            -webkit-transform: translateY(15px);
            transform: translateY(15px);
            opacity: 0;
            margin-left: calc(50% - 50px);
        }
        .upload .upload-files footer .importar.active {
            -webkit-transition: opacity .5s 1.5s ease, -webkit-transform .5s 1.5s ease;
            transition: opacity .5s 1.5s ease, -webkit-transform .5s 1.5s ease;
            transition: transform .5s 1.5s ease, opacity .5s 1.5s ease;
            transition: transform .5s 1.5s ease, opacity .5s 1.5s ease, -webkit-transform .5s 1.5s ease;
            -webkit-transform: translateY(0);
            transform: translateY(0);
            opacity: 1;
        }
        .upload .upload-files footer .importar:hover {
            background: #4db6ac;
            color: #fff;
        }
        @-webkit-keyframes fadeup {
            to {
                -webkit-transform: translateY(0);
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes fadeup {
            to {
                -webkit-transform: translateY(0);
                transform: translateY(0);
                opacity: 1;
            }
        }
        @-webkit-keyframes faderight {
            to {
                -webkit-transform: translateX(0);
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes faderight {
            to {
                -webkit-transform: translateX(0);
                transform: translateX(0);
                opacity: 1;
            }
        }
        @-webkit-keyframes fade {
            to {
                opacity: 1;
            }
        }
        @keyframes fade {
            to {
                opacity: 1;
            }
        }
        @media (max-width: 400px) {
            .upload {
                width: 100%;
                height: 100%;
            }
        }
    </style>
</head>
<body>



<link rel="stylesheet" type="text/css" href="{{asset('css/font-awesome.min.css')}}">

<div class="upload">
    <div class="upload-files">
        <header>
            <p>
                <i class="fa fa-cloud-upload" aria-hidden="true"></i>
                <span class="up">up</span>
                <span class="load">load</span>
            </p>
        </header>
        <div class="body" id="drop">
            <i class="fa fa-file-text-o pointer-none" aria-hidden="true"></i>
            <p class="pointer-none"><b>拖放到这里</b> files here <br /> or <a href="" id="triggerFile">浏览</a>开始上传</p>
            <form id="uploadForm" enctype="multipart/form-data">
                {{csrf_field()}}
                <input type="file" multiple="multiple" name="media" id="media"/>
            </form>
        </div>
        <footer>
            <div class="divider">
                <span><AR>FILES</AR></span>
            </div>
            <div class="list-files">
                <!--   template   -->
            </div>
            <button class="importar">UPDATE FILES</button>
        </footer>
    </div>
</div>

<script type="text/javascript">
    //DOM
    const $ = document.querySelector.bind(document);
    var uploading =false;
    //APP
    let App = {};
    App.init = (function() {
        //Init
        function handleFileSelect(evt,myfiles = '') {
            const files = evt ? evt.target.files : myfiles; // FileList object
            if(uploading){
                alert("文件正在上传中，请稍候");
                return false;
            }
            var formData = new FormData();
            formData.append('media',myjq("#media")[0].files[0]);
            formData.append('_token',myjq('input[name=_token]').val());
            myjq.ajax({
                url: "/qiniu/upload",
                type: 'POST',
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                dataType:"json",
                beforeSend: function(){
                    uploading = true;
                },
                success : function(data) {
                    if (data.status == 200) {

                    } else {
                        alert(data.msg);
                    }
                    uploading = false;
                }
            });

            //files template
            let template = `${Object.keys(files)
                    .map(
                            file => `<div class="file file--${file}">
     <div class="name"><span>${files[file].name}</span></div>
     <div class="progress active"></div>
     <div class="done">
	<a href="" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
		<g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z"</g>
		</svg>
						</a>
     </div>
    </div>`
                    )
                    .join("")}`;

            $("#drop").classList.add("hidden");
            $("footer").classList.add("hasFiles");
            $(".importar").classList.add("active");
            setTimeout(() => {
                $(".list-files").innerHTML = template;
        }, 1000);

            Object.keys(files).forEach(file => {
                let load = 2000 + file * 2000; // fake load
            setTimeout(() => {
                $(`.file--${file}`).querySelector(".progress").classList.remove("active");
            $(`.file--${file}`).querySelector(".done").classList.add("anim");
        }, load);
        });
        }

        // trigger input
        $("#triggerFile").addEventListener("click", evt => {
            evt.preventDefault();
        $("input[type=file]").click();
    });

        // drop events
        $("#drop").ondragleave = evt => {
            $("#drop").classList.remove("active");
            evt.preventDefault();
        };
        $("#drop").ondragover = $("#drop").ondragenter = evt => {
            $("#drop").classList.add("active");
            evt.preventDefault();
        };
        $("#drop").ondrop = evt => {
            evt.stopPropagation();
            evt.preventDefault();
            $("input[type=file]").files = evt.dataTransfer.files;
            $("footer").classList.add("hasFiles");
            $("#drop").classList.remove("active");
            handleFileSelect('',evt.dataTransfer.files);
        };

        //upload more
        $(".importar").addEventListener("click", () => {
            $(".list-files").innerHTML = "";
        $("footer").classList.remove("hasFiles");
        $(".importar").classList.remove("active");
        setTimeout(() => {
            $("#drop").classList.remove("hidden");
    }, 500);
    });

        // input change
        $("input[type=file]").addEventListener("change", handleFileSelect);
    })();
</script>

</body>
</html>
