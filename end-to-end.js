'use strict';

pb.e2e = {};

pb.addEventListener('signed_in', function(e) {
    pb.e2e.init();
});

pb.addEventListener('signed_out', function(e) {
    pb.e2e.setPassword(null);
});

pb.e2e.setPassword = function(password) {
    if (password) {
        localStorage['e2ePassword'] = password;
    } else {
        delete localStorage['e2ePassword'];
    }

    pb.e2e.init();
};

pb.e2e.getPassword = function() {
    return localStorage['e2ePassword'];
};

pb.e2e.init = function() {
    var password = localStorage['e2ePassword'] && pb.local.user;
    if (password) {
        var md = forge.md.sha256.create();
        pb.e2e.key = forge.pkcs5.pbkdf2(localStorage.e2ePassword, pb.local.user.iden, 30000, 32, md);
        pb.e2e.enabled = true;
    } else {
        delete pb.e2e.key;
        pb.e2e.enabled = false;
    }

    pb.notifier.dismiss('e2e');
};

pb.e2e.optEncrypt = function(plaintext) {
    if (pb.e2e.enabled) {
        return pb.e2e.encrypt(plaintext);
    }

    return plaintext;
};

pb.e2e.encrypt = function(plaintext) {
    if (!plaintext) {
        return null;
    }

    var bytes = forge.util.createBuffer(plaintext);
    var iv = forge.random.getBytes(12);

    var cipher = forge.cipher.createCipher('AES-GCM', pb.e2e.key);
    cipher.start({ 'iv': iv });
    cipher.update(bytes);
    cipher.finish();

    var output = forge.util.createBuffer();
    output.putBytes('1');
    output.putBytes(cipher.mode.tag.getBytes());
    output.putBytes(iv);
    output.putBytes(cipher.output.getBytes());

    return forge.util.encode64(output.getBytes());
};

pb.e2e.decrypt = function(encrypted) {
    if (!encrypted) {
        return null;
    }

    var bytes = forge.util.decode64(encrypted);

    var buffer = forge.util.createBuffer(bytes);
    buffer.getBytes(1);
    var tag = buffer.getBytes(16);
    var iv = buffer.getBytes(12);

    var decipher = forge.cipher.createDecipher('AES-GCM', pb.e2e.key);
    decipher.start({
        'iv': iv,
        'tag': tag
    });
    decipher.update(buffer);
    decipher.finish();

    return decipher.output.toString('utf8');
};
