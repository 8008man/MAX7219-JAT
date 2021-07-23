/** 
07-03-2021 @ 1030H MDT, Jon Titus
See: Maxim Integrated datasheet for MAX7219/MAX7221
Micro:Bit Pin assignments:
Chip select pin P0, SPI Clock signal at P13
MOSI (data out) at P15, MISO (data in) at P14, not used
Display example: HiLetgo 2pcs MAX7219 8-Digital Segment Digital
   LED Display or equivalent
Connect +3.3V to VCC, GND to GND, P0 to CS
Connect P13 to CLK, P15 to DIN


 */
//  Function to shift MAX7219 register address and then shift data
function set_register(register: number, data: number): boolean {
    pins.digitalWritePin(DigitalPin.P0, 0)
    pins.spiWrite(register)
    pins.spiWrite(data)
    pins.digitalWritePin(DigitalPin.P0, 1)
    return true
}

//  Function to turn off all digits
function blank_all(): boolean {
    set_register(SHUTDOWN_REG, OFF)
    let reg_id = 1
    while (reg_id < 9) {
        set_register(reg_id, 15)
        reg_id += 1
    }
    set_register(SHUTDOWN_REG, ON)
    return true
}

function MAX7219init() {
    //  SPI setup
    pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
    pins.spiFrequency(10000)
    pins.spiFormat(8, 0)
    set_register(SHUTDOWN_REG, OFF)
    //  Turn off display for programming
    set_register(SHUTDOWN_REG, OFF)
    set_register(INTENSITY_REG, 5)
    //  Set LED intensity
    set_register(SCANLIMIT_REG, 7)
    //  Set number of digits (0--7)
    set_register(DECODE_REG, DECODEMODE_B)
    //  0-9, H, E, L, P, -
    set_register(SHUTDOWN_REG, ON)
    //  Turn display on
    // set all digits to off, blank
    blank_all()
}

function Go_Display(my_string: string): boolean {
    //  Display a value, float or int
    set_register(SHUTDOWN_REG, OFF)
    //  Turn off display for  value preparation
    let digit_id = 8
    //  left-most digit first  (left to right)
    let loop_count = 0
    let loop_max = my_string.length
    while (loop_count < loop_max) {
        if (my_string[loop_count] == "-") {
            //  if negative at start
            set_register(digit_id, 10)
        } else if (my_string[loop_count] == " ") {
            //  send minus sign
            set_register(digit_id, 15)
        } else if (my_string[loop_count] == ".") {
            //  if decimal
            // get previous digit and insert dec point
            set_register(digit_id + 1, DEC_PNT + parseInt(my_string[loop_count - 1]))
            digit_id = digit_id + 1
        } else {
            set_register(digit_id, parseInt(my_string[loop_count]))
        }
        
        loop_count += 1
        digit_id -= 1
    }
    set_register(SHUTDOWN_REG, ON)
    // Turn on all digits
    return true
}

// -------------------------------------------
// Test routine, define constants, display a
// string of numbers with minus sign and
// decimal point, if any
// Constants
let OFF = 0
let ON = 1
let DIGIT_REG = 0
let DECODE_REG = 9
let DECODEMODE_B = 255
let INTENSITY_REG = 10
let SCANLIMIT_REG = 11
let SHUTDOWN_REG = 12
let TEST_REG = 15
let DEC_PNT = 128
MAX7219init()
Go_Display("-1.28 1")
// NOTE:  Python drops trailing zeros in a value
// converted to a string.  Thus:
// Go_Display(-1.2890)  displays -1.2890
// Go_Display(str(-1.2890))  displays -1.289
while (true) {
    // Do-nothing loop for testing
    ON = ON
}
