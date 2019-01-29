package bonsai.manual;

import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import javax.crypto.Cipher;

public class RSATest {

    public static void main(String [] args) throws Exception {
        // generate public and private keys
        KeyPair keyPair = buildKeyPair();
        PublicKey pubKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();


        byte[] pubBytes = pubKey.getEncoded();
        byte[] prvBytes = privateKey.getEncoded();

// now save pubBytes or prvBytes

// to recover the key
//        KeyFactory kf = KeyFactory.getInstance("RSA");
//
//        PrivateKey prv_recovered = kf.generatePrivate(new PKCS8EncodedKeySpec(prvBytes));
//        PublicKey pub_recovered = kf.generatePublic(new X509EncodedKeySpec(pubBytes));
//
//        System.out.println("Private Key: \n" + prv_recovered.toString());
//        System.out.println("Public Key: \n" + pub_recovered.toString());

        String prv_recovered = Base64.getEncoder().encodeToString(prvBytes);
        String pub_recovered = Base64.getEncoder().encodeToString(pubBytes);

        System.out.println("Private Key: \n" + prv_recovered.toString());
        System.out.println("Public Key: \n" + pub_recovered.toString());

//        pubKey.
//        System.out.println("Public Key : \n\n " + pubKey.toString() + "\n\n");


        // sign the message
        byte [] signed = encrypt(privateKey, "{\n" +
                "\t\"l\": \"50000\",\n" +
                "\t\"d\": \"1073741824\",\n" +
                "\t\"c\": \"100000\"\n" +
                "}");
        String cipherText = Base64.getEncoder().encodeToString(signed);
        System.out.println(cipherText);  // <<signed message>>

        // verify the message
        byte[] reCipherBytes = Base64.getDecoder().decode(cipherText);
        byte[] verified = decrypt(pubKey, reCipherBytes);
        System.out.println("\n\n" + new String(verified));     // This is a secret message
    }

    public static KeyPair buildKeyPair() throws NoSuchAlgorithmException {
        final int keySize = 2048;
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(keySize);
        return keyPairGenerator.genKeyPair();
    }

    public static byte[] encrypt(PrivateKey privateKey, String message) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, privateKey);

        return cipher.doFinal(message.getBytes());
    }

    public static byte[] decrypt(PublicKey publicKey, byte [] encrypted) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, publicKey);

        return cipher.doFinal(encrypted);
    }


}
