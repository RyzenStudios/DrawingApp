document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("drawingCanvas");
    const context = canvas.getContext("2d");
    let isDrawing = false;
    let drawingStack = [];
    let currentStep = -1;

    const colorPicker = document.getElementById("colorPicker");
    const thicknessInput = document.getElementById("thickness");
    const buttons = ["clearButton", "undoButton", "redoButton", "eraserButton", "downloadButton"]
        .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    buttons.clearButton.addEventListener("click", () => clearCanvas());
    buttons.undoButton.addEventListener("click", () => updateDrawing(-1));
    buttons.redoButton.addEventListener("click", () => updateDrawing(1));
    buttons.eraserButton.addEventListener("click", () => buttons.eraserButton.classList.toggle("active"));
    buttons.downloadButton.addEventListener("click", downloadCanvas);

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;

        const { value, classList } = buttons.eraserButton;
        context.lineWidth = thicknessInput.value;
        context.lineCap = "round";
        context.strokeStyle = classList.contains("active") ? "#ffffff" : colorPicker.value;

        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

        const drawingState = context.getImageData(0, 0, canvas.width, canvas.height);
        updateDrawingState(drawingState);
    }

    function stopDrawing() {
        isDrawing = false;
        context.beginPath();
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        updateDrawingState(context.getImageData(0, 0, canvas.width, canvas.height));
    }

    function updateDrawingState(drawingState) {
        if (currentStep < drawingStack.length - 1) {
            drawingStack = drawingStack.slice(0, currentStep + 1);
        }
        drawingStack.push(drawingState);
        currentStep++;
    }

    function updateDrawing(step) {
        const newPosition = currentStep + step;
        if (newPosition >= 0 && newPosition < drawingStack.length) {
            currentStep = newPosition;
            context.putImageData(drawingStack[currentStep], 0, 0);
        }
    }

    function downloadCanvas() {
        const backgroundColor = "#ffffff";
        const dataUrl = canvas.toDataURL("image/png");

        const tempCanvas = Object.assign(document.createElement("canvas"), {
            width: canvas.width,
            height: canvas.height,
            getContext: "2d"
        });

        Object.assign(tempCanvas.getContext("2d"), {
            fillStyle: backgroundColor,
            fillRect: (0, 0, tempCanvas.width, tempCanvas.height),
            drawImage: new Image().onload = () => {
                tempCanvas.getContext("2d").drawImage(img, 0, 0);
                const finalDataUrl = tempCanvas.toDataURL("image/png");
                const a = Object.assign(document.createElement("a"), {
                    href: finalDataUrl,
                    download: "drawing.png"
                });
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }).drawImage(new Image().src = dataUrl, 0, 0);
    }
});
