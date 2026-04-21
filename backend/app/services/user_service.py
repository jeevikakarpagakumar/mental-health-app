from app.models.user import User


def get_or_create_user(db, firebase_user):
    user = db.query(User).filter(User.firebase_uid == firebase_user["uid"]).first()

    if not user:
        user = User(
            firebase_uid=firebase_user["uid"],
            email=firebase_user.get("email"),
            name=firebase_user.get("name"),
            role=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
