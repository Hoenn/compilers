const programs = [
{
    "name": "Example",
    "source": 
`/*Full Grammar*/
{
    int x
    x =0
    int y
    y= 5

    while(x != y) {
        print(x)
        x = x + 1
        if(x == 3) {
            print("fizz")
        }
        if (x==5) {
            print("buzz")
        }

    }
}$
`,
    "type":null
,
    "type":null
},
{
    "name": "EOP Warning",
    "source":
`/*Missing EOP Warning*/
{
    int x
}
`,
    "type": "warning"
},
{
    "name": "Invalid Token",
    "source": 
`/*Invalid Token Error*/
{
    int y
    y = 3
    print(y * 2)
} $
`,
    "type": "error"
},
{
    "name":"abc"
},
{
    "name":"abc"
},
{
    "name":"abc"
},
{
    "name":"abc"
},
{
    "name":"abc"
},
{
    "name":"this is a longer one for width"
}
];
module.exports = {
    programs: programs
}