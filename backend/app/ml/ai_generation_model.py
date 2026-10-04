from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "ai_detector_best.pth"
)

IMAGE_SIZE = 224

# IMPORTANT:
# These class indices come directly from the
# CIFAKE training notebook.
#
# ImageFolder classes:
# FAKE = 0
# REAL = 1
#
# TrustLens interpretation:
# FAKE -> AI_GENERATED
# REAL -> REAL

CLASS_NAMES = {
    0: "AI_GENERATED",
    1: "REAL",
}


class AIGenerationModel:

    def __init__(self):

        self.device = torch.device(
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        # --------------------------------------------------
        # Build the exact architecture used during training
        # --------------------------------------------------

        self.model = models.efficientnet_b0(
            weights=None
        )

        self.model.classifier[1] = torch.nn.Linear(
            self.model.classifier[1].in_features,
            2
        )

        # --------------------------------------------------
        # Verify checkpoint exists
        # --------------------------------------------------

        if not MODEL_PATH.exists():

            raise FileNotFoundError(
                f"AI generation model checkpoint not found: "
                f"{MODEL_PATH}"
            )

        if not MODEL_PATH.is_file():

            raise RuntimeError(
                f"AI generation model path is not a file: "
                f"{MODEL_PATH}"
            )

        # --------------------------------------------------
        # Load trained state dictionary
        # --------------------------------------------------

        checkpoint = torch.load(
            MODEL_PATH,
            map_location=self.device,
            weights_only=True
        )

        self.model.load_state_dict(
            checkpoint
        )

        # --------------------------------------------------
        # Prepare model for inference
        # --------------------------------------------------

        self.model.to(
            self.device
        )

        self.model.eval()

        # --------------------------------------------------
        # Exact evaluation preprocessing used during
        # CIFAKE training
        # --------------------------------------------------

        self.transform = transforms.Compose([

            transforms.Resize(
                (IMAGE_SIZE, IMAGE_SIZE)
            ),

            transforms.ToTensor(),

            transforms.Normalize(
                mean=[
                    0.485,
                    0.456,
                    0.406
                ],
                std=[
                    0.229,
                    0.224,
                    0.225
                ]
            )
        ])

    def predict(
        self,
        image_path
    ):

        # --------------------------------------------------
        # Load image
        # --------------------------------------------------

        image = Image.open(
            image_path
        ).convert("RGB")

        # --------------------------------------------------
        # Apply training-compatible preprocessing
        # --------------------------------------------------

        tensor = self.transform(
            image
        ).unsqueeze(0)

        tensor = tensor.to(
            self.device
        )

        # --------------------------------------------------
        # Model inference
        # --------------------------------------------------

        with torch.no_grad():

            logits = self.model(
                tensor
            )

            probabilities = torch.softmax(
                logits,
                dim=1
            )[0]

        # --------------------------------------------------
        # Determine predicted class
        # --------------------------------------------------

        predicted_index = int(
            torch.argmax(
                probabilities
            ).item()
        )

        # --------------------------------------------------
        # IMPORTANT:
        #
        # Index 0 = FAKE = AI_GENERATED
        # Index 1 = REAL
        # --------------------------------------------------

        ai_generated_probability = float(
            probabilities[0].item()
        )

        real_image_probability = float(
            probabilities[1].item()
        )

        prediction = CLASS_NAMES[
            predicted_index
        ]

        confidence = float(
            probabilities[
                predicted_index
            ].item()
        )

        # --------------------------------------------------
        # Return structured result
        # --------------------------------------------------

        return {

            "prediction": prediction,

            "predicted_class_index": (
                predicted_index
            ),

            "ai_generated_probability": round(
                ai_generated_probability,
                6
            ),

            "real_image_probability": round(
                real_image_probability,
                6
            ),

            "confidence": round(
                confidence,
                6
            ),

            "model_name": (
                "EfficientNet-B0"
            ),

            "model_version": (
                "aigen-v1-cifake"
            ),

            "model_available": True,

            "device": str(
                self.device
            )
        }


_model = None


def get_ai_generation_model():

    global _model

    if _model is None:

        _model = AIGenerationModel()

    return _model