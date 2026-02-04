package com.example.demo.user.model;

// représente un objet métier
public class User {

    private static Long idCounter = 0L; // Compteur statique pour auto-incrémentation

    private Long id;
    // private String name;
    // private Integer age;
    private String email;
    private String pass;
    private String salt; // sel unique pour chaque utilisateur

    // /!\ pas de paramètre par défaut en java !

    // constructeur complet
    public User(String email, String pass, String salt) {
        this.id = ++idCounter; // Auto-incrémentation : 1, 2, 3, 4...
        this.email = email;
        this.pass = pass;
        this.salt = salt;
    }

    // public void anniversaire() { // attention : Void existe ; ce n'est pas la même chose que void
    //     this.age++;
    // }

    // Il faut ajouter les getter pour les champs qu'on veut exposer dans la réponse
    // json !
    public Long getId() {
        return id;
    }

    // public String getName() {
    //     return name;
    // }

    // public Integer getAge() {
    //     return age;
    // }

    // public void rename(String newName) {
    //     this.name = newName;
    // }

    public String getEmail(){
        return email;
    }
    public String getPass(){
        return pass;
    }
    public String getSalt(){
        return salt;
    }

    // public void rename(String newName) {
    //     this.name = newName;
    // }

}