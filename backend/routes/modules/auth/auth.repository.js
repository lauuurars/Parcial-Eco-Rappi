import { supabase } from "../../config/supabase-db.js";
import { userRepository } from "../users/users.repository.js";

class AuthRepository {

    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }

    // método signUp
    signUp = async ({ username, email, password, role, store }) => {
        const normalizedEmail = (email ?? "").trim();

        // creamos usuario en auth de supabase
        const { data: authData, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password
        });

        if (error) throw new Error(error.message);

        const authUser = authData.user;

        // creando usuario en mi db
        const profile = await this.usersRepository.createUser({
            id: authUser.id,
            username,
            email: normalizedEmail,
            role
        });

        // si es rol "store" creamos la data de la tienda
        let storeData = null;

        if (role === "store") {
            if (!store) {
                throw new Error("Datos de tienda requeridos");
            }

            const { data, error: storeError } = await supabase
                .from("stores")
                .insert([
                    {
                        owner_id: profile.id,
                        name: store.name,
                        description: store.description,
                        address: store.address
                    }
                ])
                .select()
                .single();

            if (storeError) throw new Error(storeError.message);

            storeData = data;
        }

        // respuesta
        return {
            auth: authData,
            user: profile,
            store: storeData
        };
    };

    // método login
    login = async ({ email, password }) => {
        const normalizedEmail = (email ?? "").trim();

        // validamos las credenciales del usuario 
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
        });

        if (error) throw new Error(error.message);

        const authUser = authData.user;

        // usamos el id de supabase para buscar los datos adicionales del user 
        const profile = await this.usersRepository.getUserById(
            authUser.id
        );

        if (!profile) {
            throw new Error("Usuario no encontrado en base de datos :c");
        }

        // si es admin tienda → traer su store
        let storeData = null;

        if (profile.role === "store") {
            const { data, error: storeError } = await supabase
                .from("stores")
                .select("*")
                .eq("owner_id", profile.id)
                .single();

            if (storeError) throw new Error(storeError.message);

            storeData = data;
        }

        // respuesta final
        return {
            auth: authData,
            user: profile,
            store: storeData
        };
    };
}

export const authRepository = new AuthRepository(userRepository);