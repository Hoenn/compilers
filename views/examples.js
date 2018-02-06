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
    "name":"Multiple Programs",
    "source":
`/*Multiple Programs*/
{
    int x
} $ {
    int y
} $
`,
    "type": null
},
{
    "name":"Lex Edge Cases",
    "source":
`/*Lex Edge Cases*/
"a /*b*/ c"
"int x"
int intel
intintel
"ab
`,
    "type": "warning"
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
    "name":"Fast Inverse Square Root",
    "source":
`
float Q_rsqrt( float number )
{
	long i;
	float x2, y;
	const float threehalfs = 1.5F;

	x2 = number * 0.5F;
	y  = number;
	i  = * ( long * ) &y;                       // evil floating point bit level hacking
	i  = 0x5f3759df - ( i >> 1 );               // what the fuck? 
	y  = * ( float * ) &i;
	y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//	y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
`,
    "type":"error"
},
];
module.exports = {
    programs: programs
}