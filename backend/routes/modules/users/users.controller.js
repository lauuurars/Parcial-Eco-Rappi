export class UsersController {

    constructor(repository) {
        this.repository = repository;
    }

    // método 1

    getAllUsers = async (req, res) => {
        try {
            const users = await this.repository.getAllUsers();
            res.send({ users });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 2

    getUserById = async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const user = await this.repository.getUserById(userId);

            if (!user) {
                res.send("User not found :(");
                return;
            }

            res.send({ user });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 3

    createUser = async (req, res) => {
        try {
            const newUser = await this.repository.createUser(req.body);
            res.status(201).send({ user: newUser });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
    
}