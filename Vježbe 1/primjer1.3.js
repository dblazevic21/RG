window.onload = function() {
				var platno1 = document.getElementById("canvas1");
				if(!platno1) alert("Greška - nema platna!");
				var w = platno1.width;
        var h = platno1.height;
				var ctx = platno1.getContext("2d");


        var xos = w / 2;
        var yos = h / 2;
        var scale = w / 10;

        var y;
        var x;


        ctx.beginPath();
        ctx.moveTo(0, yos);
        ctx.lineTo(w, yos);

        ctx.moveTo(xos, 0);
        ctx.lineTo(xos, h);

        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.beginPath();

        let first = true; 
        for (var i = 0; i <= 2 * Math.PI; i += 0.1) 
        {
          var x = i;
          var y = Math.sin(x);

          var canvaX = xos + scale * x;
          var canvaY = yos - scale * y;

          if (first) 
          {
            first = false;
            ctx.moveTo(canvaX, canvaY);
          } 
          else 
          {
            ctx.lineTo(canvaX, canvaY);
          }
        }

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();

      }