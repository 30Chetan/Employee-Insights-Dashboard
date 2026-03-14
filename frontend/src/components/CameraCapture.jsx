import { useRef, useState, useCallback, useEffect } from 'react';

const CameraCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const signatureCanvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startCamera = async () => {
        setError('');
        setCapturedImage(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            setIsCameraActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setError('Could not access camera. Please ensure permissions are granted.');
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
    }, [stream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Target aspect ratio 16:9 to match aspect-video UI
            const targetAspect = 16 / 9;
            const videoAspect = videoWidth / videoHeight;

            let drawWidth = videoWidth;
            let drawHeight = videoHeight;
            let startX = 0;
            let startY = 0;

            if (videoAspect > targetAspect) {
                drawWidth = videoHeight * targetAspect;
                startX = (videoWidth - drawWidth) / 2;
            } else {
                drawHeight = videoWidth / targetAspect;
                startY = (videoHeight - drawHeight) / 2;
            }

            canvas.width = drawWidth;
            canvas.height = drawHeight;

            const ctx = canvas.getContext('2d');
            // Mirror the context so captured image matches preview exactly
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, startX, startY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);

            const base64Image = canvas.toDataURL('image/jpeg', 0.8);

            setCapturedImage(base64Image);
            stopCamera();
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    useEffect(() => {
        if (capturedImage) {
            const timer = setTimeout(() => {
                const canvas = signatureCanvasRef.current;
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    const ctx = canvas.getContext('2d');
                    ctx.strokeStyle = '#ef4444'; // Red for visibility
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [capturedImage]);

    const getCoordinates = (e) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = signatureCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.closePath();
        }
    };

    const clearSignature = () => {
        const canvas = signatureCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveImage = () => {
        const canvas = document.createElement('canvas');
        const image = new Image();
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const sigCanvas = signatureCanvasRef.current;
            if (sigCanvas) {
                ctx.drawImage(sigCanvas, 0, 0, sigCanvas.width, sigCanvas.height, 0, 0, canvas.width, canvas.height);
            }

            const mergedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            if (onCapture) {
                onCapture(mergedBase64);
            }
        };
        image.src = capturedImage;
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                </div>
            )}

            <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200 aspect-video flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />

                {capturedImage ? (
                    <>
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                        />
                        <canvas
                            ref={signatureCanvasRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            onTouchCancel={stopDrawing}
                        />
                        {!isDrawing && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg pointer-events-none z-20">
                                <p className="text-white text-xs font-medium">Draw signature to confirm</p>
                            </div>
                        )}
                    </>
                ) : isCameraActive ? (
                    <div className="relative w-full h-full bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror-mode"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-black/10 rounded-2xl"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 border-2 border-white/30 rounded-full"></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Camera is off</p>
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-4">
                {!isCameraActive && !capturedImage && (
                    <button
                        onClick={startCamera}
                        className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Start Camera
                    </button>
                )}

                {isCameraActive && !capturedImage && (
                    <>
                        <button
                            onClick={stopCamera}
                            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={capturePhoto}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Capture Frame
                        </button>
                    </>
                )}

                {capturedImage && (
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={clearSignature}
                            className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Clear Signature
                        </button>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={retakePhoto}
                                className="flex-1 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Retake
                            </button>
                            <button
                                onClick={saveImage}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Approve & Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
