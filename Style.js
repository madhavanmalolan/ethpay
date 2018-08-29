import {StyleSheet} from 'react-native';
const Theme = {
    text : "#44331f",
    accent: "#203145",
    accentText : "#ffffff",
    bg : "#3d526b",

}

export default StyleSheet.create({
    card: {
        margin : 16,
        padding : 16,
        borderRadius : 8,
        backgroundColor : "#fefefe"
    },

    heavyTextDark : {
        fontWeight : 'bold',
        fontSize : 18,
        color : Theme.text,
        marginLeft : 4,
        marginTop : 8,
        marginRight : 4,
        marginBottom : 8
    },

    textDark : {
        fontSize : 16,
        color : Theme.text,
        marginLeft : 4,
        marginTop : 4,
        marginRight : 4,
        marginBottom : 4
    },
    textLight : {
        fontSize : 16,
        color : Theme.accentText,
        marginLeft : 4,
        marginTop : 4,
        marginRight : 4,
        marginBottom : 4
    },
    fullButton : {
        width : '100%',
        height : 64,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor: Theme.accent
    },
    bottomFullButton : {
        position: 'absolute',
        bottom : 0,
        width : '100%',
        height : 64,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor: Theme.accent

    },

    halfButton : {
        width : '50%',
        height : 64,
        justifyContent : 'center',
        alignItems : 'center',
        backgroundColor: Theme.accent

    },
    base : {
        backgroundColor : Theme.bg,
        flex:1
    }


})

