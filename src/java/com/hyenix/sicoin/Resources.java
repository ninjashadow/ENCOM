/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.hyenix.sicoin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author santiago
 */
@Stateless
@Path("/Usuarios")
public class Resources {

    /**
     *
     * @return
     */
    @Path("/HelloWorld")
    @GET
    public String HelloWorld() {
        return "Hola";
    }

    /**
     *
     * @param sourceInfo
     * @return
     */
    @Path("/RegistrarUsuario")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String RegistrarUsuario(String sourceInfo) {
        JSONObject mensaje = new JSONObject();
        String correo = new JSONObject(sourceInfo).getString("correo");
        String password = new JSONObject(sourceInfo).getString("password");
        int id = new JSONObject(sourceInfo).getInt("id");
        String nombre = new JSONObject(sourceInfo).getString("nombre");
        String direccion = new JSONObject(sourceInfo).getString("direccion");
        boolean administrador = new JSONObject(sourceInfo).getBoolean("administrador");
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            Statement st = conexion.createStatement();
            PreparedStatement query = conexion.prepareStatement("SELECT nombre FROM usuarios WHERE correo=? OR id=?");
            query.setString(1, correo);
            query.setInt(2, id);
            ResultSet rset = query.executeQuery();
            if (rset.next()) {
                mensaje.put("Registrado", false);
                mensaje.put("Mensaje", "Ya existe un usuario registrado con el correo " + correo + " o con el ID " + id);
            } else {
                st.executeUpdate("INSERT INTO usuarios(correo,password,id,nombre,direccion,administrador) VALUES('" + correo + "','" + password + "'," + id + ",'" + nombre + "','" + direccion + "'," + administrador + ");");
                mensaje.put("Mensaje", "Se ha registrado el usuario con el correo " + correo);
                mensaje.put("Registrado", true);
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Registrado", false);
            mensaje.put("Mensaje", "Ha ocurrido un problema");
        }
        return mensaje.toString();
    }

    /**
     *
     * @param sourceInfo
     * @return
     */
    @Path("/IniciarSesion")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String IniciarSesion(String sourceInfo) {
        JSONObject mensaje = new JSONObject();
        String correo = new JSONObject(sourceInfo).getString("correo");
        String password = new JSONObject(sourceInfo).getString("password");
        boolean admin = new JSONObject(sourceInfo).getBoolean("administrador");
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            PreparedStatement query = conexion.prepareStatement("SELECT * FROM usuarios WHERE correo=? AND password=? AND administrador=?");
            query.setString(1, correo);
            query.setString(2, password);
            query.setBoolean(3, admin);
            ResultSet rset = query.executeQuery();
            if (rset.next()) {
                if (admin) {
                    mensaje.put("Sesion", true);
                    mensaje.put("Admin_User", true);
                    mensaje.put("Nombre", rset.getString("nombre"));
                    mensaje.put("ID", rset.getInt("id"));
                } else {
                    mensaje.put("Sesion", true);
                    mensaje.put("Admin_User", false);
                    mensaje.put("Nombre", rset.getString("nombre"));
                    mensaje.put("ID", rset.getInt("id"));
                }
            } else {
                mensaje.put("Error", false);
                mensaje.put("Mensaje", "Los datos introducidos son incorrectos");
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Error", true);
            mensaje.put("Mensaje", "Ha ocurrido un problema con la base de datos");
        }
        return mensaje.toString();

    }

    /**
     *
     * @param sourceInfo
     * @return
     */
    @Path("/ObtenerDatosPersonales")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String ObtenerDatosPersonales(String sourceInfo) {
        JSONObject mensaje = new JSONObject();
        String correo = new JSONObject(sourceInfo).getString("correo");
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            PreparedStatement query = conexion.prepareStatement("SELECT * FROM usuarios WHERE correo=?");
            query.setString(1, correo);
            ResultSet rset = query.executeQuery();
            if (rset.next()) {
                mensaje.put("Busqueda", true);
                mensaje.put("Correo", rset.getString("correo"));
                mensaje.put("Password", rset.getString("password"));
                mensaje.put("ID", rset.getInt("id"));
                mensaje.put("Nombre", rset.getString("nombre"));
                mensaje.put("Direccion", rset.getString("direccion"));
                mensaje.put("Administrador", rset.getBoolean("administrador"));
            } else {
                mensaje.put("Busqueda", false);
                mensaje.put("Mensaje", "No se ha encontrado el usuario");
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Busqueda", false);
            mensaje.put("Mensaje", "Ha ocurrido un problema");
        }
        return mensaje.toString();
    }

    /**
     *
     * @return JSON
     */
    @Path("/ObtenerDatosGenerales")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String ObtenerDatosGenerales() {
        JSONObject mensaje = new JSONObject();
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            Statement query = conexion.createStatement();
            ResultSet rset = query.executeQuery("SELECT * FROM usuarios order by administrador");
            if (rset.next()) {
                JSONArray data = new JSONArray();
                rset.beforeFirst();
                while (rset.next()) {
                    JSONObject temporal = new JSONObject();
                    temporal.put("Correo", rset.getString("correo"));
                    temporal.put("ID", rset.getInt("id"));
                    temporal.put("Nombre", rset.getString("nombre"));
                    temporal.put("Direccion", rset.getString("direccion"));
                    temporal.put("Administrador", rset.getInt("administrador"));
                    data.put(temporal);
                }
                mensaje.put("Busqueda", true);
                mensaje.put("Usuarios", data);
            } else {
                mensaje.put("Busqueda", false);
                mensaje.put("Mensaje", "No se ha encontrado nada");
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Busqueda", false);
            mensaje.put("Mensaje", "Ha ocurrido un problema");
        }
        return mensaje.toString();
    }

    /**
     *
     * @param sourceInfo
     * @return
     */
    @Path("/ModificarDatosUsuario")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String ModificarDatosUsuario(String sourceInfo) {
        /*
         Solo se podran modificar la password, la direccion y el ID
         */
        JSONObject mensaje = new JSONObject();
        int id = new JSONObject(sourceInfo).getInt("id");
        String correo = new JSONObject(sourceInfo).getString("correo");
        String direccion = new JSONObject(sourceInfo).getString("direccion");
        String password = new JSONObject(sourceInfo).getString("password");
        String user = new JSONObject(sourceInfo).getString("usuario");
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            PreparedStatement query = conexion.prepareStatement("UPDATE usuarios SET password=?, id=?, direccion=?, nombre=? WHERE correo=?");
            query.setString(1, password);
            query.setInt(2, id);
            query.setString(3, direccion);
            query.setString(4, user);
            query.setString(5, correo);
            int qr = query.executeUpdate();
            PreparedStatement query2 = conexion.prepareStatement("SELECT * from usuarios WHERE correo=? AND password=? AND direccion=? and id=?");
            query2.setString(1, correo);
            query2.setString(2, password);
            query2.setString(3, direccion);
            query2.setInt(4, id);
            ResultSet rset = query2.executeQuery();
            if (rset.next()) {
                mensaje.put("Arreglado", true);
                mensaje.put("Mensaje", "Datos cambiados con exito");
            } else {
                mensaje.put("Arreglado", false);
                mensaje.put("Mensaje", "No se ha cambiado los datos");
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Arreglado", false);
            mensaje.put("Mensaje", "Ha ocurrido un problema");
        }
        return mensaje.toString();
    }

    /*
     Notas:
     Se necesita arreglar el problema cuando el REQUEST @POST es cambiado por @DELETE
     Se debe arreglar la busqueda antes de intentar eliminar el usuario
     */
    @Path("/EliminarUsuario")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String EliminarUsuario(String sourceInfo) {
        String correo = new JSONObject(sourceInfo).getString("correo");
        JSONObject mensaje = new JSONObject();
        try {
            Connection conexion = DataConn.connect();
            if (conexion == null) {
                throw new SQLException();
            }
            PreparedStatement query3 = conexion.prepareStatement("SELECT nombre from usuarios WHERE correo=?");
            query3.setString(1, correo);
            ResultSet rset2 = query3.executeQuery();
            if (rset2.next()) {
                PreparedStatement query = conexion.prepareStatement("DELETE FROM usuarios WHERE correo=?");
                query.setString(1, correo);
                query.executeUpdate();
                PreparedStatement query2 = conexion.prepareStatement("SELECT nombre FROM usuarios WHERE correo=?");
                query2.setString(1, correo);
                ResultSet rset = query2.executeQuery();
                if (rset.next()) {
                    mensaje.put("Eliminado", false);
                    mensaje.put("Mensaje", "No se ha eliminado el usuario");
                } else {
                    mensaje.put("Eliminado", true);
                    mensaje.put("Mensaje", "Se ha eliminado el usuario con el correo " + correo);
                }
            } else {
                mensaje.put("Eliminado", false);
                mensaje.put("Mensaje", "El usuario no existe");
            }
        } catch (SQLException sqlEx) {
            mensaje.put("Eliminado", false);
            mensaje.put("Mensaje", "Ha ocurrido un problema");
        }
        return mensaje.toString();
    }
}
