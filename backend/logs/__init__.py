# -*- coding: utf-8 -*-
import os
import json
from datetime import datetime
from typing import Any, Dict

class GenerationLogger:
    """Generation流程日志记录器"""

    def __init__(self, base_dir: str = None):
        if base_dir is None:
            base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
        self._timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self._file_handlers = {}

    def _get_file_path(self, step_name: str) -> str:
        filename = f"{step_name}_{self._timestamp}.log"
        return os.path.join(self.base_dir, filename)

    def _write_log(self, step_name: str, message: str):
        file_path = self._get_file_path(step_name)
        with open(file_path, 'a', encoding='utf-8') as f:
            f.write(message)
            f.write('\n')
            f.flush()

    def log_step1_extraction(self, stage: str, data: Any):
        msg = f"=== {stage} ===\nData: {json.dumps(data, ensure_ascii=False, indent=2) if isinstance(data, (dict, list)) else str(data)}"
        self._write_log("step1_extraction", msg)

    def log_step2_merge(self, stage: str, data: Any):
        msg = f"=== {stage} ===\nData: {json.dumps(data, ensure_ascii=False, indent=2) if isinstance(data, (dict, list)) else str(data)}"
        self._write_log("step2_merge", msg)

    def log_step3_input(self, entity_type: str, element_name: str, prompt: str, context: str = ""):
        msg = f"=== Generation Input: {element_name} ===\nPrompt length: {len(prompt)}\nPrompt:\n{prompt}"
        if context:
            msg += f"\nContext:\n{context}"
        self._write_log(f"step3_{entity_type}_input", msg)

    def log_step3_output(self, entity_type: str, element_name: str, raw_response: str, parsed_result: Dict[str, Any]):
        msg = f"=== Generation Output: {element_name} ===\nRaw response length: {len(raw_response)}\nRaw response:\n{raw_response}\nParsed result: {json.dumps(parsed_result, ensure_ascii=False, indent=2)}"
        self._write_log(f"step3_{entity_type}_output", msg)

    def log_step4_save(self, entity_type: str, element_name: str, data: Dict[str, Any], result: Dict[str, Any]):
        msg = f"=== Save: {element_name} ===\nInput data: {json.dumps(data, ensure_ascii=False, indent=2)}\nSave result: {json.dumps(result, ensure_ascii=False, indent=2)}"
        self._write_log(f"step4_{entity_type}_save", msg)

    def log_checkpoint(self, stage: str, data: Any):
        msg = f"=== Checkpoint: {stage} ===\nData: {json.dumps(data, ensure_ascii=False, indent=2) if isinstance(data, (dict, list)) else str(data)}"
        self._write_log(f"checkpoint_{stage}", msg)

generation_logger = GenerationLogger()