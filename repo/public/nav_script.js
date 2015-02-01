$(document).ready(function(){
            $(".active").attr('class', '');
            var path = window.location.pathname;
            console.log(path.split('/'));
            switch(path.split('/')[1]){
                case (""):
                    $("#1").attr('class','active');
                    break;
                case ("login"):
                    $("#1").attr('class','active');
                    break;
                case ("signup"):
                    $("#1").attr('class','active');
                    break;
                case ("search"):
                    $("#2").attr('class','active');
                    break;
                case ("submit"):
                    $("#3").attr('class','active');
                    break;
                case ("api/upload"):
                    $("#3").attr('class','active');
                    break;
                case ("my_thesis"):
                    $("#4").attr('class','active');
                    break;
                case ("all"):
                    $("#5").attr('class','active');
                    break;
                case ("doc_view"):
                    $("#5").attr('class','active');
                    break;
                case ("restapi"):
                    $("#restapi").attr('class','active');
                    break;

            }
        });
