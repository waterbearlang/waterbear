
/*wb.choiceLists.rpi_gpio = ["AIR", "STONE", "GRASS", "DIRT", "COBBLESTONE", "WOOD_PLANKS", "SAPLING", "BEDROCK", "WATER_FLOWING", "WATER_STATIONARY", "LAVA_FLOWING", "LAVA_STATIONARY", "SAND", "GRAVEL", "GOLD_ORE", "IRON_ORE", "COAL_ORE", "WOOD", "LEAVES", "GLASS", "LAPIS_LAZULI_ORE", "LAPIS_LAZULI_BLOCK", "SANDSTONE", "BED", "COBWEB", "GRASS_TALL", "WOOL", "FLOWER_YELLOW", "FLOWER_CYAN", "MUSHROOM_BROWN", "MUSHROOM_RED", "GOLD_BLOCK", "IRON_BLOCK", "STONE_SLAB_DOUBLE", "STONE_SLAB", "BRICK_BLOCK", "TNT", "BOOKSHELF", "MOSS_STONE", "OBSIDIAN", "TORCH", "FIRE", "STAIRS_WOOD", "CHEST", "DIAMOND_ORE", "DIAMOND_BLOCK", "CRAFTING_TABLE", "FARMLAND", "FURNACE_INACTIVE", "FURNACE_ACTIVE", "DOOR_WOOD", "LADDER", "STAIRS_COBBLESTONE", "DOOR_IRON", "REDSTONE_ORE", "SNOW", "ICE", "SNOW_BLOCK", "CACTUS", "CLAY", "SUGAR_CANE", "FENCE", "GLOWSTONE_BLOCK", "BEDROCK_INVISIBLE", "GLASS_PANE", "MELON", "FENCE_GATE", "GLOWING_OBSIDIAN", "NETHER_REACTOR_CORE"];

wb.choiceLists.types = wb.choiceLists.types.concat(['block']);
wb.choiceLists.rettypes = wb.choiceLists.rettypes.concat(['block']);
*/

/* Add Input type and toolkists list */

//wb.choiceLists.digitalinputpins = {"0":'Pin 0',"1":'Pin 1',"2":'Pin 2',"3":'Pin 3',"4":'Pin 4',"5":'Pin 5',"6":'Pin 6',"7":'Pin 7',"8":'Pin 8',"9":'Pin 9',"10":'Pin 10',"11":'Pin 11',"12":'Pin 12','A0':'Pin A0','A1':'Pin A1','A2':'Pin A2','A3':'Pin A3','A4':'Pin A4','A5':'A5'};
wb.choiceLists.digitalinputpins = [0, 1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,10 , 11, 12, 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

wb.choiceLists.digitaloutputpins = [0, 1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,10 , 11, 12, 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

// TODO :  using https://github.com/fivdi/onoff because of its syncronous API


/*  TODO : security issues

After the WiringPi gpio utility has been successfully installed, it can be used to export/unexport GPIOs and the application can be executed without superuser privileges. Let's assume that the application is the led/button example from above.

Step 1 - Export GPIOs with gpio

Run the following commands to export GPIO #17 and #18:

gpio export 17 out
gpio export 18 in

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that unlike the initial led/button example, the applications exit function does not attempt to unexport the GPIOs when it terminates.

var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    process.exit();
}

process.on('SIGINT', exit);

Step 3 - Unxport GPIOs with gpio

After the application has terminated, run the following commands to unexport GPIO #17 and #18:

gpio unexport 17
gpio unexport 18

*/
