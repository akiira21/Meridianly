from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from food.models import FoodPreset, FoodLog
from food.schemas import FoodPresetCreateRequest, FoodLogCreateRequest

DEFAULT_FOOD_PRESETS = [
    {"name": "White Rice (cooked)", "category": "grains", "calories_per_100g": 130, "protein_per_100g": 2.7, "carbs_per_100g": 28, "fat_per_100g": 0.3},
    {"name": "Brown Rice (cooked)", "category": "grains", "calories_per_100g": 112, "protein_per_100g": 2.6, "carbs_per_100g": 24, "fat_per_100g": 0.9},
    {"name": "Wheat Roti", "category": "grains", "calories_per_100g": 264, "protein_per_100g": 8.5, "carbs_per_100g": 52, "fat_per_100g": 2.0},
    {"name": "Tandoori Roti", "category": "grains", "calories_per_100g": 280, "protein_per_100g": 9, "carbs_per_100g": 55, "fat_per_100g": 2.5},
    {"name": "Naan", "category": "grains", "calories_per_100g": 310, "protein_per_100g": 9, "carbs_per_100g": 52, "fat_per_100g": 8},
    {"name": "Paratha", "category": "grains", "calories_per_100g": 320, "protein_per_100g": 7, "carbs_per_100g": 45, "fat_per_100g": 12},
    {"name": "Idli", "category": "grains", "calories_per_100g": 120, "protein_per_100g": 4, "carbs_per_100g": 24, "fat_per_100g": 0.5},
    {"name": "Dosa", "category": "grains", "calories_per_100g": 170, "protein_per_100g": 4, "carbs_per_100g": 30, "fat_per_100g": 4},
    {"name": "Poha", "category": "grains", "calories_per_100g": 180, "protein_per_100g": 3, "carbs_per_100g": 35, "fat_per_100g": 3},
    {"name": "Upma", "category": "grains", "calories_per_100g": 160, "protein_per_100g": 4, "carbs_per_100g": 28, "fat_per_100g": 4},
    {"name": "Oats (cooked)", "category": "grains", "calories_per_100g": 70, "protein_per_100g": 2.5, "carbs_per_100g": 12, "fat_per_100g": 1.5},
    {"name": "Dal (Toor)", "category": "proteins", "calories_per_100g": 120, "protein_per_100g": 7, "carbs_per_100g": 20, "fat_per_100g": 2},
    {"name": "Dal (Masoor)", "category": "proteins", "calories_per_100g": 110, "protein_per_100g": 8, "carbs_per_100g": 18, "fat_per_100g": 1.5},
    {"name": "Dal (Moong)", "category": "proteins", "calories_per_100g": 105, "protein_per_100g": 7.5, "carbs_per_100g": 17, "fat_per_100g": 1.2},
    {"name": "Dal (Chana)", "category": "proteins", "calories_per_100g": 130, "protein_per_100g": 8, "carbs_per_100g": 21, "fat_per_100g": 2.5},
    {"name": "Rajma", "category": "proteins", "calories_per_100g": 130, "protein_per_100g": 8, "carbs_per_100g": 21, "fat_per_100g": 2},
    {"name": "Chole", "category": "proteins", "calories_per_100g": 140, "protein_per_100g": 7, "carbs_per_100g": 22, "fat_per_100g": 3},
    {"name": "Aloo Gobi", "category": "vegetables", "calories_per_100g": 90, "protein_per_100g": 2, "carbs_per_100g": 10, "fat_per_100g": 4},
    {"name": "Aloo Matar", "category": "vegetables", "calories_per_100g": 100, "protein_per_100g": 3, "carbs_per_100g": 14, "fat_per_100g": 4},
    {"name": "Baingan Bharta", "category": "vegetables", "calories_per_100g": 85, "protein_per_100g": 2, "carbs_per_100g": 8, "fat_per_100g": 5},
    {"name": "Palak Paneer", "category": "vegetables", "calories_per_100g": 140, "protein_per_100g": 6, "carbs_per_100g": 6, "fat_per_100g": 10},
    {"name": "Paneer Butter Masala", "category": "vegetables", "calories_per_100g": 220, "protein_per_100g": 8, "carbs_per_100g": 8, "fat_per_100g": 16},
    {"name": "Mix Veg", "category": "vegetables", "calories_per_100g": 80, "protein_per_100g": 2.5, "carbs_per_100g": 10, "fat_per_100g": 3.5},
    {"name": "Sambar", "category": "vegetables", "calories_per_100g": 70, "protein_per_100g": 3, "carbs_per_100g": 12, "fat_per_100g": 1.5},
    {"name": "Rasam", "category": "vegetables", "calories_per_100g": 40, "protein_per_100g": 1.5, "carbs_per_100g": 6, "fat_per_100g": 1},
    {"name": "Bhindi Masala", "category": "vegetables", "calories_per_100g": 95, "protein_per_100g": 2, "carbs_per_100g": 8, "fat_per_100g": 6},
    {"name": "Chicken Curry", "category": "proteins", "calories_per_100g": 180, "protein_per_100g": 18, "carbs_per_100g": 5, "fat_per_100g": 9},
    {"name": "Butter Chicken", "category": "proteins", "calories_per_100g": 250, "protein_per_100g": 16, "carbs_per_100g": 8, "fat_per_100g": 16},
    {"name": "Chicken Tikka", "category": "proteins", "calories_per_100g": 200, "protein_per_100g": 22, "carbs_per_100g": 4, "fat_per_100g": 10},
    {"name": "Tandoori Chicken", "category": "proteins", "calories_per_100g": 190, "protein_per_100g": 24, "carbs_per_100g": 2, "fat_per_100g": 9},
    {"name": "Mutton Curry", "category": "proteins", "calories_per_100g": 220, "protein_per_100g": 20, "carbs_per_100g": 4, "fat_per_100g": 13},
    {"name": "Egg Curry", "category": "proteins", "calories_per_100g": 150, "protein_per_100g": 10, "carbs_per_100g": 6, "fat_per_100g": 9},
    {"name": "Boiled Egg", "category": "proteins", "calories_per_100g": 155, "protein_per_100g": 13, "carbs_per_100g": 1, "fat_per_100g": 11},
    {"name": "Fish Curry", "category": "proteins", "calories_per_100g": 160, "protein_per_100g": 18, "carbs_per_100g": 4, "fat_per_100g": 7},
    {"name": "Prawn Curry", "category": "proteins", "calories_per_100g": 140, "protein_per_100g": 20, "carbs_per_100g": 3, "fat_per_100g": 5},
    {"name": "Veg Biryani", "category": "grains", "calories_per_100g": 170, "protein_per_100g": 4, "carbs_per_100g": 28, "fat_per_100g": 5},
    {"name": "Chicken Biryani", "category": "grains", "calories_per_100g": 190, "protein_per_100g": 10, "carbs_per_100g": 25, "fat_per_100g": 6},
    {"name": "Pulao", "category": "grains", "calories_per_100g": 150, "protein_per_100g": 3, "carbs_per_100g": 26, "fat_per_100g": 4},
    {"name": "Lemon Rice", "category": "grains", "calories_per_100g": 160, "protein_per_100g": 3, "carbs_per_100g": 28, "fat_per_100g": 4.5},
    {"name": "Curd Rice", "category": "grains", "calories_per_100g": 130, "protein_per_100g": 4, "carbs_per_100g": 22, "fat_per_100g": 3},
    {"name": "Pani Puri (1 piece)", "category": "snacks", "calories_per_100g": 180, "protein_per_100g": 3, "carbs_per_100g": 28, "fat_per_100g": 6},
    {"name": "Samosa", "category": "snacks", "calories_per_100g": 260, "protein_per_100g": 4, "carbs_per_100g": 30, "fat_per_100g": 13},
    {"name": "Pakora", "category": "snacks", "calories_per_100g": 240, "protein_per_100g": 5, "carbs_per_100g": 22, "fat_per_100g": 14},
    {"name": "Bhel Puri", "category": "snacks", "calories_per_100g": 150, "protein_per_100g": 4, "carbs_per_100g": 25, "fat_per_100g": 4},
    {"name": "Dhokla", "category": "snacks", "calories_per_100g": 160, "protein_per_100g": 5, "carbs_per_100g": 25, "fat_per_100g": 5},
    {"name": "Kachori", "category": "snacks", "calories_per_100g": 320, "protein_per_100g": 6, "carbs_per_100g": 35, "fat_per_100g": 17},
    {"name": "Medu Vada", "category": "snacks", "calories_per_100g": 210, "protein_per_100g": 5, "carbs_per_100g": 22, "fat_per_100g": 11},
    {"name": "Paneer Tikka", "category": "proteins", "calories_per_100g": 210, "protein_per_100g": 16, "carbs_per_100g": 5, "fat_per_100g": 14},
    {"name": "Chana Chaat", "category": "snacks", "calories_per_100g": 140, "protein_per_100g": 6, "carbs_per_100g": 20, "fat_per_100g": 4},
    {"name": "Curd (Dahi)", "category": "dairy", "calories_per_100g": 60, "protein_per_100g": 3.5, "carbs_per_100g": 4.7, "fat_per_100g": 3.3},
    {"name": "Paneer", "category": "dairy", "calories_per_100g": 265, "protein_per_100g": 18, "carbs_per_100g": 6, "fat_per_100g": 20},
    {"name": "Milk (full fat)", "category": "dairy", "calories_per_100g": 61, "protein_per_100g": 3.2, "carbs_per_100g": 4.8, "fat_per_100g": 3.3},
    {"name": "Lassi (sweet)", "category": "beverages", "calories_per_100g": 90, "protein_per_100g": 3, "carbs_per_100g": 14, "fat_per_100g": 2.5},
    {"name": "Masala Chai", "category": "beverages", "calories_per_100g": 50, "protein_per_100g": 1.5, "carbs_per_100g": 6, "fat_per_100g": 2},
    {"name": "Filter Coffee", "category": "beverages", "calories_per_100g": 40, "protein_per_100g": 1, "carbs_per_100g": 4, "fat_per_100g": 2},
    {"name": "Coconut Chutney", "category": "sides", "calories_per_100g": 120, "protein_per_100g": 2, "carbs_per_100g": 6, "fat_per_100g": 10},
    {"name": "Mint Chutney", "category": "sides", "calories_per_100g": 60, "protein_per_100g": 1, "carbs_per_100g": 8, "fat_per_100g": 3},
    {"name": "Raita", "category": "sides", "calories_per_100g": 50, "protein_per_100g": 2, "carbs_per_100g": 5, "fat_per_100g": 2},
    {"name": "Pickle (Achaar)", "category": "sides", "calories_per_100g": 80, "protein_per_100g": 1, "carbs_per_100g": 8, "fat_per_100g": 5},
    {"name": "Papad", "category": "sides", "calories_per_100g": 370, "protein_per_100g": 12, "carbs_per_100g": 55, "fat_per_100g": 12},
    {"name": "Gulab Jamun", "category": "desserts", "calories_per_100g": 350, "protein_per_100g": 4, "carbs_per_100g": 50, "fat_per_100g": 15},
    {"name": "Rasgulla", "category": "desserts", "calories_per_100g": 180, "protein_per_100g": 3, "carbs_per_100g": 35, "fat_per_100g": 3},
    {"name": "Jalebi", "category": "desserts", "calories_per_100g": 380, "protein_per_100g": 3, "carbs_per_100g": 65, "fat_per_100g": 12},
    {"name": "Kheer", "category": "desserts", "calories_per_100g": 150, "protein_per_100g": 4, "carbs_per_100g": 22, "fat_per_100g": 5},
    {"name": "Halwa", "category": "desserts", "calories_per_100g": 320, "protein_per_100g": 3, "carbs_per_100g": 45, "fat_per_100g": 14},
    {"name": "Laddu", "category": "desserts", "calories_per_100g": 450, "protein_per_100g": 6, "carbs_per_100g": 55, "fat_per_100g": 22},
    {"name": "Banana", "category": "fruits", "calories_per_100g": 89, "protein_per_100g": 1.1, "carbs_per_100g": 23, "fat_per_100g": 0.3},
    {"name": "Apple", "category": "fruits", "calories_per_100g": 52, "protein_per_100g": 0.3, "carbs_per_100g": 14, "fat_per_100g": 0.2},
    {"name": "Mango", "category": "fruits", "calories_per_100g": 60, "protein_per_100g": 0.8, "carbs_per_100g": 15, "fat_per_100g": 0.4},
    {"name": "Papaya", "category": "fruits", "calories_per_100g": 43, "protein_per_100g": 0.5, "carbs_per_100g": 11, "fat_per_100g": 0.3},
    {"name": "Orange", "category": "fruits", "calories_per_100g": 47, "protein_per_100g": 0.9, "carbs_per_100g": 12, "fat_per_100g": 0.1},
    {"name": "Grapes", "category": "fruits", "calories_per_100g": 69, "protein_per_100g": 0.7, "carbs_per_100g": 18, "fat_per_100g": 0.2},
    {"name": "Watermelon", "category": "fruits", "calories_per_100g": 30, "protein_per_100g": 0.6, "carbs_per_100g": 8, "fat_per_100g": 0.2},
    {"name": "Chapati (thin)", "category": "grains", "calories_per_100g": 240, "protein_per_100g": 8, "carbs_per_100g": 48, "fat_per_100g": 1.5},
    {"name": "Khichdi", "category": "grains", "calories_per_100g": 140, "protein_per_100g": 5, "carbs_per_100g": 24, "fat_per_100g": 3},
    {"name": "Thepla", "category": "grains", "calories_per_100g": 260, "protein_per_100g": 7, "carbs_per_100g": 40, "fat_per_100g": 9},
    {"name": "Appam", "category": "grains", "calories_per_100g": 160, "protein_per_100g": 3, "carbs_per_100g": 28, "fat_per_100g": 4},
    {"name": "Puttu", "category": "grains", "calories_per_100g": 150, "protein_per_100g": 3, "carbs_per_100g": 28, "fat_per_100g": 3},
    {"name": "Misal Pav", "category": "grains", "calories_per_100g": 180, "protein_per_100g": 7, "carbs_per_100g": 22, "fat_per_100g": 7},
    {"name": "Pav Bhaji", "category": "grains", "calories_per_100g": 170, "protein_per_100g": 4, "carbs_per_100g": 24, "fat_per_100g": 7},
    {"name": "Vada Pav", "category": "grains", "calories_per_100g": 280, "protein_per_100g": 6, "carbs_per_100g": 38, "fat_per_100g": 11},
    {"name": "Dahi Vada", "category": "snacks", "calories_per_100g": 150, "protein_per_100g": 5, "carbs_per_100g": 18, "fat_per_100g": 6},
    {"name": "Moong Dal Cheela", "category": "grains", "calories_per_100g": 140, "protein_per_100g": 8, "carbs_per_100g": 18, "fat_per_100g": 4},
    {"name": "Besan Chilla", "category": "grains", "calories_per_100g": 150, "protein_per_100g": 7, "carbs_per_100g": 16, "fat_per_100g": 6},
    {"name": "Sabudana Khichdi", "category": "grains", "calories_per_100g": 160, "protein_per_100g": 1, "carbs_per_100g": 32, "fat_per_100g": 3},
    {"name": "Aloo Paratha", "category": "grains", "calories_per_100g": 290, "protein_per_100g": 6, "carbs_per_100g": 40, "fat_per_100g": 12},
    {"name": "Gobi Paratha", "category": "grains", "calories_per_100g": 250, "protein_per_100g": 6, "carbs_per_100g": 38, "fat_per_100g": 9},
    {"name": "Methi Paratha", "category": "grains", "calories_per_100g": 240, "protein_per_100g": 6, "carbs_per_100g": 36, "fat_per_100g": 9},
    {"name": "Ragi Mudde", "category": "grains", "calories_per_100g": 120, "protein_per_100g": 3, "carbs_per_100g": 24, "fat_per_100g": 1},
    {"name": "Ragi Dosa", "category": "grains", "calories_per_100g": 150, "protein_per_100g": 4, "carbs_per_100g": 26, "fat_per_100g": 3.5},
    {"name": "Tomato Soup", "category": "soups", "calories_per_100g": 40, "protein_per_100g": 1.5, "carbs_per_100g": 6, "fat_per_100g": 1},
    {"name": "Sweet Corn Soup", "category": "soups", "calories_per_100g": 55, "protein_per_100g": 2, "carbs_per_100g": 8, "fat_per_100g": 1.5},
    {"name": "Hot and Sour Soup", "category": "soups", "calories_per_100g": 45, "protein_per_100g": 2, "carbs_per_100g": 6, "fat_per_100g": 1.5},
    {"name": "Manchow Soup", "category": "soups", "calories_per_100g": 60, "protein_per_100g": 2, "carbs_per_100g": 8, "fat_per_100g": 2},
    {"name": "Malai Kofta", "category": "vegetables", "calories_per_100g": 180, "protein_per_100g": 5, "carbs_per_100g": 10, "fat_per_100g": 13},
    {"name": "Chana Masala", "category": "proteins", "calories_per_100g": 145, "protein_per_100g": 7, "carbs_per_100g": 20, "fat_per_100g": 4},
    {"name": "Kadai Paneer", "category": "vegetables", "calories_per_100g": 200, "protein_per_100g": 8, "carbs_per_100g": 8, "fat_per_100g": 14},
    {"name": "Matar Paneer", "category": "vegetables", "calories_per_100g": 160, "protein_per_100g": 7, "carbs_per_100g": 10, "fat_per_100g": 10},
    {"name": "Shahi Paneer", "category": "vegetables", "calories_per_100g": 230, "protein_per_100g": 8, "carbs_per_100g": 8, "fat_per_100g": 17},
    {"name": "Vegetable Korma", "category": "vegetables", "calories_per_100g": 140, "protein_per_100g": 4, "carbs_per_100g": 10, "fat_per_100g": 10},
    {"name": "Navratan Korma", "category": "vegetables", "calories_per_100g": 150, "protein_per_100g": 4, "carbs_per_100g": 12, "fat_per_100g": 10},
    {"name": "Dum Aloo", "category": "vegetables", "calories_per_100g": 120, "protein_per_100g": 2, "carbs_per_100g": 12, "fat_per_100g": 7},
    {"name": "Chole Bhature", "category": "grains", "calories_per_100g": 280, "protein_per_100g": 7, "carbs_per_100g": 38, "fat_per_100g": 11},
    {"name": "Soya Chaap", "category": "proteins", "calories_per_100g": 170, "protein_per_100g": 15, "carbs_per_100g": 8, "fat_per_100g": 9},
    {"name": "Tofu Curry", "category": "proteins", "calories_per_100g": 140, "protein_per_100g": 12, "carbs_per_100g": 6, "fat_per_100g": 8},
]


def _ensure_system_presets(db: Session):
    exists = db.query(FoodPreset).filter(FoodPreset.is_system == True).first()
    if exists:
        return
    for item in DEFAULT_FOOD_PRESETS:
        preset = FoodPreset(
            name=item["name"],
            category=item["category"],
            calories_per_100g=item["calories_per_100g"],
            protein_per_100g=item["protein_per_100g"],
            carbs_per_100g=item["carbs_per_100g"],
            fat_per_100g=item["fat_per_100g"],
            is_system=True,
            user_id=None,
        )
        db.add(preset)
    db.commit()


class FoodService:
    @staticmethod
    def get_presets(db: Session, user_id: int, category: str | None = None):
        _ensure_system_presets(db)
        query = db.query(FoodPreset).filter(
            (FoodPreset.is_system == True) | (FoodPreset.user_id == user_id)
        )
        if category:
            query = query.filter(FoodPreset.category == category)
        return query.order_by(FoodPreset.name).all()

    @staticmethod
    def create_custom_preset(db: Session, user_id: int, data: FoodPresetCreateRequest):
        preset = FoodPreset(
            name=data.name,
            category=data.category,
            calories_per_100g=data.calories_per_100g,
            protein_per_100g=data.protein_per_100g,
            carbs_per_100g=data.carbs_per_100g,
            fat_per_100g=data.fat_per_100g,
            is_system=False,
            user_id=user_id,
        )
        db.add(preset)
        db.commit()
        db.refresh(preset)
        return preset

    @staticmethod
    def delete_preset(db: Session, preset_id: int, user_id: int):
        preset = db.query(FoodPreset).filter(
            FoodPreset.id == preset_id,
            FoodPreset.user_id == user_id,
            FoodPreset.is_system == False,
        ).first()
        if not preset:
            return False
        db.delete(preset)
        db.commit()
        return True

    @staticmethod
    def log_food(db: Session, user_id: int, data: FoodLogCreateRequest):
        log = FoodLog(
            user_id=user_id,
            food_preset_id=data.food_preset_id,
            food_name=data.food_name,
            amount_g=data.amount_g,
            calculated_calories=data.calories,
            calculated_protein=data.protein,
            calculated_carbs=data.carbs,
            calculated_fat=data.fat,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_today_logs(db: Session, user_id: int):
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_at >= today,
            FoodLog.logged_at < tomorrow,
        ).order_by(FoodLog.logged_at.desc()).all()

        total_calories = sum(l.calculated_calories for l in logs)
        total_protein = sum(l.calculated_protein for l in logs)
        total_carbs = sum(l.calculated_carbs for l in logs)
        total_fat = sum(l.calculated_fat for l in logs)

        return {
            "logs": logs,
            "summary": {
                "total_calories": round(total_calories, 1),
                "total_protein": round(total_protein, 1),
                "total_carbs": round(total_carbs, 1),
                "total_fat": round(total_fat, 1),
                "entry_count": len(logs),
            }
        }

    @staticmethod
    def get_history(db: Session, user_id: int, limit: int = 30, offset: int = 0):
        query = db.query(FoodLog).filter(FoodLog.user_id == user_id)
        total = query.count()
        items = query.order_by(FoodLog.logged_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def delete_log(db: Session, log_id: int, user_id: int):
        log = db.query(FoodLog).filter(
            FoodLog.id == log_id,
            FoodLog.user_id == user_id,
        ).first()
        if not log:
            return False
        db.delete(log)
        db.commit()
        return True
