import torch
import torch.nn as nn

from torchvision.models import (
    efficientnet_b0,
    EfficientNet_B0_Weights
)


class OrdinalDRClassifier(nn.Module):

    def __init__(
        self,
        num_classes=5,
        pretrained=True
    ):
        super().__init__()

        if pretrained:
            weights = EfficientNet_B0_Weights.DEFAULT
        else:
            weights = None

        self.backbone = efficientnet_b0(
            weights=weights
        )

        feature_dim = (
            self.backbone.classifier[1].in_features
        )

        self.backbone.classifier = nn.Identity()

        self.dropout = nn.Dropout(
            p=0.35
        )

        # Four ordinal thresholds:
        # >0, >1, >2, >3
        self.ordinal_head = nn.Linear(
            feature_dim,
            num_classes - 1
        )

        # Auxiliary 5-class head
        self.classification_head = nn.Linear(
            feature_dim,
            num_classes
        )

    def forward(self, x):

        features = self.backbone(x)

        features = self.dropout(
            features
        )

        ordinal_logits = self.ordinal_head(
            features
        )

        class_logits = self.classification_head(
            features
        )

        return {
            "ordinal": ordinal_logits,
            "classification": class_logits,
            "features": features
        }


def create_model(
    num_classes=5,
    pretrained=True
):

    return OrdinalDRClassifier(
        num_classes=num_classes,
        pretrained=pretrained
    )


def ordinal_targets(labels, num_classes=5):

    """
    Convert class labels:

    0 → [0,0,0,0]
    1 → [1,0,0,0]
    2 → [1,1,0,0]
    3 → [1,1,1,0]
    4 → [1,1,1,1]
    """

    targets = torch.zeros(
        labels.size(0),
        num_classes - 1,
        device=labels.device
    )

    for threshold in range(
        num_classes - 1
    ):

        targets[:, threshold] = (
            labels > threshold
        ).float()

    return targets


def ordinal_to_class(
    ordinal_logits
):

    probabilities = torch.sigmoid(
        ordinal_logits
    )

    predictions = (
        probabilities > 0.5
    ).sum(dim=1)

    return predictions.long()