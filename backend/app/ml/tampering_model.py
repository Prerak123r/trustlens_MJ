from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "tampering_model.pth"
)

IMAGE_SIZE = 224

CLASS_NAMES = {
    0: "AUTHENTIC",
    1: "TAMPERED",
}


class TamperingDetectionModel:

    def __init__(self):

        self.device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        self.model = models.resnet18(
            weights=None
        )

        self.model.fc = torch.nn.Linear(
            self.model.fc.in_features,
            2
        )

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Tampering model checkpoint not found: "
                f"{MODEL_PATH}"
            )

        if not MODEL_PATH.is_file():
            raise RuntimeError(
                f"Tampering model path is not a file: "
                f"{MODEL_PATH}"
            )

        checkpoint = torch.load(
            MODEL_PATH,
            map_location=self.device,
            weights_only=True
        )

        self.model.load_state_dict(checkpoint)

        self.model.to(self.device)
        self.model.eval()

        # Must match the training notebook.
        # The CASIA2 model was trained without
        # ImageNet normalization.
        self.transform = transforms.Compose([
            transforms.Resize(
                (IMAGE_SIZE, IMAGE_SIZE)
            ),
            transforms.ToTensor()
        ])

    def predict(self, image_path):

        image = Image.open(
            image_path
        ).convert("RGB")

        tensor = (
            self.transform(image)
            .unsqueeze(0)
            .to(self.device)
        )

        with torch.no_grad():

            logits = self.model(tensor)

            probabilities = torch.softmax(
                logits,
                dim=1
            )[0]

        predicted_index = int(
            torch.argmax(
                probabilities
            ).item()
        )

        authentic_probability = float(
            probabilities[0].item()
        )

        tampered_probability = float(
            probabilities[1].item()
        )

        prediction = CLASS_NAMES[
            predicted_index
        ]

        confidence = float(
            probabilities[predicted_index].item()
        )

        return {
            "prediction": prediction,
            "predicted_class_index": predicted_index,
            "authentic_probability": round(
                authentic_probability,
                6
            ),
            "tampered_probability": round(
                tampered_probability,
                6
            ),
            "confidence": round(
                confidence,
                6
            ),
            "model_name": "ResNet-18",
            "model_version": "tampering-v1-casia2",
            "dataset": "CASIA2",
            "model_available": True,
            "device": str(self.device)
        }


_model = None


def get_tampering_model():

    global _model

    if _model is None:
        _model = TamperingDetectionModel()

    return _model