db.createUser(
        {
            user: "cop",
            pwd: "cop",
            roles: [
                {
                    role: "readWrite",
                    db: "cop"
                }
            ]
        }
);