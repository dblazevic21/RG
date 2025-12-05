function drawButterfly() {
                const ctx = gks.g;
                const tmin = parseFloat(tminSlider.value);
                const tmax = parseFloat(tmaxSlider.value);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                gks.koristiBoju("purple");
                let prvi = true;

                for (let t = tmin; t <= tmax; t += 0.02) {
                    const base = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t/12), 5);
                    const x = base * Math.sin(t);
                    const y = base * Math.cos(t);

                    if (prvi) {
                        prvi = false;
                        gks.postaviNa(x, y);
                    } else {
                        gks.linijaDo(x, y);
                    }
                }

                gks.povuciLiniju();
            }