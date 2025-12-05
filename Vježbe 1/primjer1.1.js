window.onload = function() {
				var platno1 = document.getElementById("canvas1");
				if(!platno1) alert("Greška - nema platna!");
				var w = platno1.width;
				var h = platno1.height;
				var g = platno1.getContext("2d");


        var hor = 0;
        for (var i = 0; i <= 40; i++)
        {
          g.beginPath();
          g.moveTo(hor, 0);
          g.lineTo(hor, h);
          g.lineTo(hor, w);
          g.strokeStyle = "lightgray";
          hor += 40;
          g.stroke();
        }

        var ver = 0;
        for (var j = 0; j <= 40; j++)
        {
          g.beginPath();
          g.moveTo(0, ver);
          g.lineTo(h, ver);
          g.lineTo(w, ver);
          g.strokeStyle = "lightgray";
          ver += 40;
          g.stroke();
        }



      }