
'''
07-03-2021 @ 1030H MDT, Jon Titus
See: Maxim Integrated datasheet for MAX7219/MAX7221
Micro:Bit Pin assignments:
Chip select pin P0, SPI Clock signal at P13
MOSI (data out) at P15, MISO (data in) at P14, not used
Display example: HiLetgo 2pcs MAX7219 8-Digital Segment Digital
   LED Display or equivalent
Connect +3.3V to VCC, GND to GND, P0 to CS
Connect P13 to CLK, P15 to DIN

'''
# Function to shift MAX7219 register address and then shift data
def set_register(register, data):
    pins.digital_write_pin(DigitalPin.P0, 0)
    pins.spi_write(register)
    pins.spi_write(data)
    pins.digital_write_pin(DigitalPin.P0, 1)
    return True

# Function to turn off all digits
def blank_all():
    set_register(SHUTDOWN_REG, OFF)
    reg_id = 1
    while reg_id < 9:
        set_register(reg_id, 15)
        reg_id += 1
    set_register(SHUTDOWN_REG, ON)
    return True

def MAX7219init():
    # SPI setup
    pins.spi_pins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
    pins.spi_frequency(10000)
    pins.spi_format(8, 0)
    set_register(SHUTDOWN_REG, OFF)

    # Turn off display for programming
    set_register(SHUTDOWN_REG, OFF)
    set_register(INTENSITY_REG, 5)          # Set LED intensity
    set_register(SCANLIMIT_REG, 7)          # Set number of digits (0--7)
    set_register(DECODE_REG, DECODEMODE_B)  # 0-9, H, E, L, P, -
    set_register(SHUTDOWN_REG, ON)          # Turn display on

    #set all digits to off, blank
    blank_all()

def Go_Display(my_string):# Display a value, float or int
    set_register(SHUTDOWN_REG, OFF)    # Turn off display for  value preparation
    digit_id = 8                       # left-most digit first  (left to right)
    loop_count = 0
    loop_max = len(my_string)
    while loop_count < loop_max:
        if my_string[loop_count] == "-":    # if negative at start
            set_register(digit_id, 10)      # send minus sign
        elif my_string[loop_count] == " ":
            set_register(digit_id, 15)
        elif my_string[loop_count] == ".":  # if decimal
            #get previous digit and insert dec point
            set_register(digit_id + 1, DEC_PNT + int(my_string[loop_count - 1]))
            digit_id = digit_id + 1
        else:
            set_register(digit_id, int(my_string[loop_count]))
        loop_count +=1
        digit_id -=1
    set_register(SHUTDOWN_REG, ON)  #Turn on all digits
    return True

#-------------------------------------------
#Test routine, define constants, display a
#string of numbers with minus sign and
#decimal point, if any
#Constants
OFF = 0
ON = 1
DIGIT_REG = 0
DECODE_REG = 9
DECODEMODE_B = 255
INTENSITY_REG = 10
SCANLIMIT_REG = 11
SHUTDOWN_REG = 12
TEST_REG = 15
DEC_PNT = 128

MAX7219init()
Go_Display("-1.28 1")
#NOTE:  Python drops trailing zeros in a value
#converted to a string.  Thus:
#Go_Display(-1.2890)  displays -1.2890
#Go_Display(str(-1.2890))  displays -1.289

while True:     #Do-nothing loop for testing
    ON = ON

# -----  end  -----
