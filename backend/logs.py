import logging
import os
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(LOG_DIR, f'generation_{datetime.now().strftime("%Y%m%d")}.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

generation_logger = logging.getLogger('generation')

class GenerationLogger:
    def __init__(self, logger):
        self.logger = logger

    def log_step1_extract(self, entity_type, content, result):
        self.logger.info(f"[Step1-Extract] {entity_type}: {content[:50]}... -> {len(result)} items")

    def log_step2_merge(self, entity_type, merged_count, sources):
        self.logger.info(f"[Step2-Merge] {entity_type}: merged {merged_count} from {len(sources)} sources")

    def log_step3_generate(self, entity_type, name, prompt_preview):
        self.logger.info(f"[Step3-Generate] {entity_type}: {name}")

    def log_step4_save(self, entity_type, name, data, related):
        self.logger.info(f"[Step4-Save] {entity_type}: {name} saved")

    def log_error(self, step, entity_type, error):
        self.logger.error(f"[Error-{step}] {entity_type}: {str(error)}")

generation_logger = GenerationLogger(generation_logger)