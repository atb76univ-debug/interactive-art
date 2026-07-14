export class UIController {
  constructor(elements) {
    this.elements = elements;
    this.showCamera = false;
    this.showSkeleton = false;
    this.debugMode = false;
    this.lastFpsText = "";
    this.lastPeopleText = "";
  }

  bind(handlers) {
    this.elements.startCameraBtn.addEventListener("click", handlers.onStartCamera);
    this.elements.stopCameraBtn.addEventListener("click", handlers.onStopCamera);
    this.elements.showCameraBtn.addEventListener("click", () => this.setCameraVisible(true));
    this.elements.hideCameraBtn.addEventListener("click", () => this.setCameraVisible(false));
    this.elements.showSkeletonBtn.addEventListener("click", () => this.setSkeletonVisible(true));
    this.elements.hideSkeletonBtn.addEventListener("click", () => this.setSkeletonVisible(false));
    this.elements.fullscreenBtn.addEventListener("click", handlers.onFullscreen);
    this.elements.debugBtn.addEventListener("click", () => this.setDebugMode(!this.debugMode));
    this.updateButtonStates();
  }

  setCameraVisible(isVisible) {
    this.showCamera = isVisible;
    this.elements.cameraVideo.classList.toggle("is-visible", isVisible);
    this.updateButtonStates();
  }

  setSkeletonVisible(isVisible) {
    this.showSkeleton = isVisible;
    this.elements.debugCanvas.classList.toggle("is-visible", isVisible);
    this.updateButtonStates();
  }

  setDebugMode(isEnabled) {
    this.debugMode = isEnabled;
    this.setCameraVisible(isEnabled);
    this.setSkeletonVisible(isEnabled);
    this.elements.debugBtn.textContent = isEnabled ? "Debug ON" : "Debug OFF";
    this.updateButtonStates();
  }

  setLoading(isLoading) {
    this.elements.loadingPanel.classList.toggle("is-hidden", !isLoading);
  }

  setRunning(isRunning) {
    this.elements.startCameraBtn.disabled = isRunning;
    this.elements.stopCameraBtn.disabled = !isRunning;
  }

  updateStats(fps, peopleCount) {
    const fpsText = String(Math.round(fps));
    const peopleText = String(peopleCount);

    if (fpsText !== this.lastFpsText) {
      this.elements.fpsText.textContent = fpsText;
      this.lastFpsText = fpsText;
    }

    if (peopleText !== this.lastPeopleText) {
      this.elements.peopleText.textContent = peopleText;
      this.lastPeopleText = peopleText;
    }
  }

  updateButtonStates() {
    this.elements.showCameraBtn.setAttribute("aria-pressed", String(this.showCamera));
    this.elements.hideCameraBtn.setAttribute("aria-pressed", String(!this.showCamera));
    this.elements.showSkeletonBtn.setAttribute("aria-pressed", String(this.showSkeleton));
    this.elements.hideSkeletonBtn.setAttribute("aria-pressed", String(!this.showSkeleton));
    this.elements.debugBtn.setAttribute("aria-pressed", String(this.debugMode));
  }
}
