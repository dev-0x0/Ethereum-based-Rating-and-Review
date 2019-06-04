
// This function has been modified slightly from this version:
// https://stackoverflow.com/a/7616484/2208850
hashCode = (str) => {
    let hash = 0, i, char;

    if (str.length === 0) return hash;

    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};

// console.log(hashCode('James Smith:123 Fake St.:353879923832:james@smith.com:4444:user:pass'));
// Hash output -> 1604647555