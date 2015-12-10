/* 
 * Dieses Material steht unter der Creative-Commons-Lizenz Namensnennung - Nicht kommerziell - Keine Bearbeitungen 4.0 International.
 * Um eine Kopie dieser Lizenz zu sehen, besuchen Sie http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */
$(document).ready(function () {

    var $core = $("#quoteMash");

    var source = [
        "Damit du weisst, was und wie du redest!",
        "Zeichnen ist Sprache für die Augen, Sprache ist Malerei für das Ohr:Joseph Joubert",
        "Erfahrung im Unterrichten",
        "Der Unterschied zwischen dem richtigen Wort und dem beinahe richtigen ist derselbe Unterschied wie zwischen dem Blitz und einem Glühwürmchen:Mark Twain",
        "Slang ist der durchgescheuerte Hosenboden der Sprache:Truman Capote",
        "Damit du weisst, was und wie du redest!",
        "Wer auf andre Leute wirken will, der muss erst einmal in ihrer Sprache mit ihnen reden:Kurt Tucholsky",
        "Unterricht wie Sie wünschen!",
        "Auch ein Mensch, der zwanzig Sprachen beherrscht, gebraucht seine Muttersprache, wenn er sich in den Finger schneidet:Jean-Paul Belmondo",
        "Freude im Unterricht",
        "Es wird immer gleich ein wenig anders, wenn man es ausspricht:Hermann Hesse",
        "Die Sprache ist die Kleidung der Gedanken:Samuel Johnson",
        "Ich verstehe nur Bahnhof!"
    ];

    var quoteBody = [
        "<div class='quote'><div class='quoteText' style='font-size: 1.2em;'>#</div><div class='quoteAuthor'>#</div><div class='quoteStrip'></div></div>",
        "<div class='quote simpl'><div class='quoteText' style='font-size: 1.3em;'>#</div><div class='quoteStrip' style='top:1px;'></div></div>"
    ];

    var colors = [
        "rgb(215, 98, 56)", // light red
        "rgb(173, 0, 0)", // dark red
        "rgb(163, 80, 80)", // chrome
        "rgb(163, 80, 153)", // lila
        "rgb(80, 80, 163)", // slight lila/blue
        "rgb(80, 163, 160)", // aqua
        "rgb(58, 195, 143)", // blue/green
        "rgb(80, 163, 93)", // forest
        "orange" // desert
    ];

    var i = 0,
        blocked = [];

    function quote(text) {
        var req = text.split(":");

        if (req.length == 2) {
            var text = req[0],
                    author = req[1],
                    body = quoteBody[0].replace(/\#/, text).replace(/\#/, author);
        } else {
            var text = req[0],
                    body = quoteBody[1].replace(/\#/, text);
        }

        return body;
    }

    function createAndAnimate() {
        $core.append(quote(source[i]));

        var $el = $core.children("div:last-child");

        var width = $el.outerWidth(true),
            height = $el.outerHeight(true);

        var base = {
                height: 200,
                width: 1100
            };
        var pos = {
                top: "",
                left: ""
            };
            
        // This is where we put our element
        function findPoints(rep){

            var allowed = {
                height: base.height - height,
                width: base.width - width
            };

            pos.top = randomRange(0,allowed.height);
            pos.left = randomRange(0,allowed.width);
            
            //console.log("Trying values: TOP = "+pos.top+"px and LEFT = "+pos.left+"px; TRY nr. "+rep+" @ "+i);

            for(var k = 0; k < blocked.length; k++){
                try{
                    /*if(typeof blocked[k] == "undefined"){
                        console.error("THIS IS BAD!")
                        blocked.splice(k,1);
                        k = 0;
                        if(k == blocked.length){break;}
                    }*/
                    if(((pos.top < blocked[k][0])&&(pos.top+height < blocked[k][0]))||(pos.top > blocked[k][2])){
                        // true
                    } else {
                        if(((pos.left < blocked[k][3])&&(pos.left + width < blocked[k][3]))||(pos.left > blocked[k][1])){
                            // true
                        } else {
                            if(rep > 100){
                                return false;
                            }
                            return findPoints(rep+1);
                        }
                    }
                } catch(err){
                    return false;
                }
            }
            return true;
        }

        if(!findPoints(0)){
            setTimeout(function(){
                createAndAnimate();
            },300);
            
            $el.remove();
            return false;
        }

        $el.css({"top":pos.top+"px", "left":pos.left+"px"});
        blocked.push([pos.top, pos.left+width, pos.top + height, pos.left]);

        var color = colors[randomRange(0, colors.length - 1)];

        // Change color
        $el.css("color", color);
        $el.find(".quoteStrip").css("background-color", color);

        var time = source[i].match(/ /g).length - 2;
        //var t_org = time;
        if(time < 6){
            time = 6;
        } else if(time > 10){
            time = 10;
        }
        //console.log("Time was "+t_org+" now is "+time);

        $el.transform("scale(0.4)");

        $el.transition("transform " + time + "s cubic-bezier(.24,.93,.61,.41), opacity 0.3s", true);

        setTimeout(function () {
            $el.transform("scale(1)");
            $el.css("opacity", "1");

            setTimeout(function () {
                if (i > (source.length - 2)) {
                    i = -1;
                    setTimeout(function(){
                        createAndAnimate(i++);
                    },4000);
                } else {
                    createAndAnimate(i++);
                }
            }, time * 1000 - 3000);

            setTimeout(function () {
                $el.css("opacity", "");
                setTimeout(function () {
                    $el.remove();
                    blocked.splice(0,1);
                }, 500);
            }, time * 1000 - 300);
        }, 100);
    }

    createAndAnimate(i);
});