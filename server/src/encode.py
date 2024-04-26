# from towhee import pipe, ops
import torch
from task_former.clip import _transform, tokenize
from task_former.model import CLIP
import json
from config import MODLE_CONFIG_FILE, MODLE_WEIGHT, DEVICE


class TaskFormer:
    def __init__(self):
        with open(MODLE_CONFIG_FILE, 'r') as f:
            cfg = json.load(f)
        cp = torch.load(MODLE_WEIGHT, map_location='cpu')['state_dict']
        if next(iter(cp.items()))[0].startswith('module'):
            cp = {k[len('module.'):]: v for k, v in cp.items()}

        self.model = CLIP(**cfg)
        self.model.load_state_dict(cp, strict=False)
        self.model.eval()
        self.model = self.model.to(DEVICE)

        self.img_preprocess = _transform(self.model.visual.input_resolution, is_train=False)
        self.text_preprocess = tokenize

    @torch.no_grad()
    def extract_img_feat(self, x, preprocess=True):
        if preprocess:
            x = self.img_preprocess(x).unsqueeze(0).to(DEVICE)
        x = self.model.encode_image(x)
        x = x / x.norm(dim=-1, keepdim=True)
        return x

    @torch.no_grad()
    def extract_query_feat(self, text=None, sketch=None):
        assert not (text is None and sketch is None)
        sketch_fea, text_fea = 0, 0
        if sketch:
            sketch = self.img_preprocess(sketch).unsqueeze(0).to(DEVICE)
            sketch_fea = self.model.encode_sketch(sketch)
            sketch_fea = sketch_fea / sketch_fea.norm(dim=-1, keepdim=True)
        if text:
            text = self.text_preprocess([str(text)])[0].unsqueeze(0).to(DEVICE)
            text_fea = self.model.encode_text(text)
            text_fea = text_fea / text_fea.norm(dim=-1, keepdim=True)

        if text is None or sketch is None:
            return sketch_fea + text_fea
        else:
            return self.model.feature_fuse(text_fea, sketch_fea)
