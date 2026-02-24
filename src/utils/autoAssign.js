// Keyword maps for auto-assigning items to sections by list type.
// Each entry maps a section name (lowercase, matches the `name` field in sections)
// to an array of keywords. The item name is checked against each keyword
// using a simple includes() match.

const GROCERY_KEYWORDS = {
  'produce': [
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry',
    'blackberry', 'lemon', 'lime', 'avocado', 'tomato', 'potato', 'sweet potato',
    'onion', 'garlic', 'shallot', 'carrot', 'celery', 'lettuce', 'spinach', 'kale',
    'arugula', 'broccoli', 'cauliflower', 'pepper', 'bell pepper', 'jalapeño',
    'mushroom', 'cucumber', 'zucchini', 'corn', 'peas', 'green bean', 'snap pea',
    'cabbage', 'brussels sprout', 'asparagus', 'beet', 'radish', 'turnip',
    'artichoke', 'eggplant', 'squash', 'butternut', 'acorn squash', 'pumpkin',
    'watermelon', 'cantaloupe', 'honeydew', 'pineapple', 'mango', 'papaya',
    'peach', 'plum', 'nectarine', 'pear', 'cherry', 'fig', 'date', 'coconut',
    'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary', 'dill', 'chive',
    'ginger', 'turmeric root', 'leek', 'scallion', 'green onion', 'fennel',
    'bok choy', 'collard', 'chard', 'endive', 'radicchio', 'watercress',
  ],
  'bakery': [
    'bread', 'bagel', 'muffin', 'croissant', 'donut', 'doughnut', 'cake', 'pie',
    'roll', 'bun', 'tortilla', 'wrap', 'english muffin', 'pita', 'naan', 'baguette',
    'sourdough', 'rye', 'flatbread', 'focaccia', 'ciabatta', 'brioche',
    'brownie', 'scone', 'biscuit', 'waffle cone', 'breadstick',
  ],
  'dairy & eggs': [
    'milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'sour cream',
    'cottage cheese', 'half and half', 'creamer', 'whipped cream', 'heavy cream',
    'parmesan', 'cheddar', 'mozzarella', 'brie', 'feta', 'gouda', 'swiss',
    'american cheese', 'cream cheese', 'almond milk', 'oat milk', 'soy milk',
    'kefir', 'ghee', 'queso', 'ricotta', 'provolone', 'havarti', 'goat cheese',
    'string cheese', 'colby', 'monterey jack',
  ],
  'meat & poultry': [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'veal', 'duck', 'bacon',
    'sausage', 'hot dog', 'ground beef', 'ground turkey', 'ground pork',
    'steak', 'ribs', 'brisket', 'chuck', 'sirloin', 'tenderloin', 'loin',
    'burger', 'patty', 'wing', 'thigh', 'breast', 'drumstick', 'chop',
    'roast', 'corned beef', 'prosciutto', 'pancetta', 'chorizo', 'bratwurst',
    'kielbasa', 'pepperoni', 'salami', 'ham', 'pork belly',
  ],
  'seafood': [
    'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'scallop', 'oyster',
    'clam', 'mussel', 'tilapia', 'cod', 'halibut', 'mahi', 'trout', 'catfish',
    'bass', 'anchovy', 'sardine', 'squid', 'octopus', 'swordfish', 'snapper',
    'grouper', 'flounder', 'sole', 'pollock', 'haddock', 'mackerel',
  ],
  'deli': [
    'deli', 'lunch meat', 'cold cut', 'pastrami', 'roast beef', 'turkey breast',
    'bologna', 'liverwurst', 'mortadella', 'capicola', 'coppa',
  ],
  'frozen': [
    'frozen', 'ice cream', 'popsicle', 'gelato', 'sorbet', 'sherbet',
    'frozen pizza', 'frozen waffle', 'frozen pancake', 'frozen burrito',
    'nugget', 'tater tot', 'french fry', 'edamame', 'frozen vegetable',
    'frozen fruit', 'ice pack', 'ice bag',
  ],
  'canned & dry goods': [
    'canned', 'can of', 'beans', 'lentil', 'chickpea', 'rice', 'pasta',
    'noodle', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'macaroni',
    'oatmeal', 'cereal', 'granola', 'quinoa', 'couscous', 'barley', 'farro',
    'flour', 'sugar', 'brown sugar', 'powdered sugar', 'cornstarch',
    'baking powder', 'baking soda', 'yeast', 'bread crumb', 'panko', 'stuffing',
    'broth', 'stock', 'tomato sauce', 'tomato paste', 'crushed tomato',
    'diced tomato', 'soup', 'chili', 'stew', 'coconut milk', 'evaporated milk',
    'condensed milk', 'lentils', 'split pea', 'black bean', 'kidney bean',
    'pinto bean', 'navy bean', 'cannellini', 'garbanzo',
  ],
  'snacks': [
    'chip', 'cracker', 'cookie', 'popcorn', 'pretzel', 'nut', 'peanut',
    'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia',
    'trail mix', 'granola bar', 'protein bar', 'energy bar', 'rice cake',
    'beef jerky', 'dried fruit', 'candy', 'chocolate', 'gummy', 'lollipop',
    'fruit snack', 'veggie straw', 'tortilla chip', 'kettle chip',
  ],
  'beverages': [
    'water', 'juice', 'soda', 'pop', 'cola', 'coffee', 'tea', 'beer', 'wine',
    'sports drink', 'energy drink', 'lemonade', 'sparkling water', 'kombucha',
    'cider', 'latte', 'espresso', 'cold brew', 'iced tea', 'gatorade',
    'powerade', 'vitamin water', 'coconut water', 'smoothie', 'protein shake',
    'seltzers', 'seltzer', 'club soda', 'tonic water', 'mixer', 'cocktail mix',
  ],
  'condiments & spices': [
    'ketchup', 'mustard', 'mayo', 'mayonnaise', 'vinegar', 'olive oil',
    'vegetable oil', 'canola oil', 'coconut oil', 'avocado oil', 'sesame oil',
    'dressing', 'ranch', 'hot sauce', 'sriracha', 'tabasco', 'soy sauce',
    'tamari', 'worcestershire', 'teriyaki', 'marinade', 'salsa', 'hummus',
    'guacamole', 'jam', 'jelly', 'peanut butter', 'almond butter', 'nutella',
    'honey', 'maple syrup', 'agave', 'molasses', 'bbq sauce', 'steak sauce',
    'fish sauce', 'oyster sauce', 'hoisin', 'miso', 'tahini', 'pesto',
    'aioli', 'tzatziki', 'relish', 'pickle', 'capers', 'anchovy paste',
    'salt', 'pepper', 'cumin', 'paprika', 'oregano', 'cinnamon', 'nutmeg',
    'cayenne', 'chili powder', 'garlic powder', 'onion powder', 'curry',
    'turmeric', 'coriander', 'cardamom', 'clove', 'allspice', 'bay leaf',
    'vanilla extract', 'almond extract', 'spice', 'seasoning', 'herb',
  ],
  'cleaning supplies': [
    'dish soap', 'laundry detergent', 'detergent', 'bleach', 'cleaner',
    'all purpose cleaner', 'sponge', 'scrub', 'brush', 'mop', 'broom',
    'trash bag', 'garbage bag', 'paper towel', 'napkin', 'tissue',
    'toilet paper', 'disinfectant', 'windex', 'lysol', 'pledge',
    'dryer sheet', 'fabric softener', 'stain remover', 'oxy clean',
    'dishwasher pod', 'dishwasher tablet', 'rinse aid', 'foil', 'plastic wrap',
    'parchment paper', 'zip lock', 'ziploc', 'storage bag', 'sandwich bag',
    'wipes', 'disinfecting wipe', 'cleaning wipe', 'rubber glove',
  ],
  'personal care': [
    'shampoo', 'conditioner', 'body wash', 'face wash', 'toothpaste',
    'toothbrush', 'floss', 'mouthwash', 'razor', 'shaving cream', 'deodorant',
    'lotion', 'moisturizer', 'sunscreen', 'spf', 'chapstick', 'lip balm',
    'cotton ball', 'cotton swab', 'q-tip', 'bandage', 'band-aid', 'aspirin',
    'tylenol', 'advil', 'ibuprofen', 'acetaminophen', 'vitamin', 'supplement',
    'contact lens', 'eye drop', 'ear drop', 'antacid', 'allergy',
    'nail polish', 'nail file', 'hair tie', 'bobby pin', 'hair spray',
    'dry shampoo', 'face mask', 'serum', 'toner', 'exfoliant',
  ],
}

const HARDWARE_KEYWORDS = {
  'lumber & building materials': [
    'wood', 'lumber', 'board', 'plywood', 'osb', 'drywall', 'sheetrock',
    'cement', 'concrete', 'stucco', 'mortar', 'grout', 'insulation',
    'stud', 'joist', 'rafter', 'beam', 'post', 'column', 'trim', 'molding',
    'fascia', 'soffit', 'siding', 'brick', 'block', 'stone', 'sand', 'gravel',
    'rebar', 'mesh', 'foam board', 'vapor barrier', 'house wrap',
  ],
  'electrical': [
    'wire', 'cable', 'outlet', 'receptacle', 'switch', 'breaker', 'panel',
    'conduit', 'junction box', 'electrical box', 'wire nut', 'connector',
    'gfci', 'arc fault', 'afci', 'dimmer', 'timer', 'transformer',
    'extension cord', 'power strip', 'surge protector', 'light switch',
    'electrical tape', 'romex', 'thhn', 'circuit', 'fuse', 'relay',
  ],
  'plumbing': [
    'pipe', 'fitting', 'coupling', 'elbow', 'tee', 'valve', 'shut-off',
    'faucet', 'drain', 'trap', 'p-trap', 'toilet', 'shower', 'bathtub',
    'sink', 'supply line', 'flapper', 'wax ring', 'plumber', 'pvc', 'cpvc',
    'pex', 'copper tube', 'solder', 'flux', 'teflon tape', 'plumber tape',
    'plunger', 'snake', 'auger', 'caulk', 'sealant', 'water heater',
  ],
  'paint & supplies': [
    'paint', 'primer', 'sealer', 'stain', 'varnish', 'polyurethane', 'lacquer',
    'brush', 'roller', 'tray', 'drop cloth', 'painter tape', 'masking tape',
    'sandpaper', 'sanding', 'putty', 'spackling', 'spackle', 'joint compound',
    'paint thinner', 'mineral spirit', 'turpentine', 'acetone', 'stripper',
    'caulk', 'spray paint', 'touch up', 'paint can',
  ],
  'fasteners & hardware': [
    'screw', 'nail', 'bolt', 'nut', 'washer', 'anchor', 'toggle bolt',
    'lag screw', 'deck screw', 'drywall screw', 'wood screw', 'machine screw',
    'rivet', 'staple', 'hinge', 'latch', 'hasp', 'hook', 'eye bolt',
    'u-bolt', 'carriage bolt', 'lock', 'door knob', 'cabinet hardware',
    'drawer pull', 'handle', 'bracket', 'angle iron', 'joist hanger',
    'hurricane tie', 'post base', 'strap', 'clip', 'clamp', 'pin',
  ],
  'tools': [
    'drill', 'saw', 'circular saw', 'jig saw', 'miter saw', 'table saw',
    'hammer', 'wrench', 'screwdriver', 'level', 'tape measure', 'square',
    'pliers', 'wire stripper', 'utility knife', 'box cutter', 'pry bar',
    'crowbar', 'chisel', 'file', 'rasp', 'clamp', 'vise', 'router',
    'sander', 'orbital sander', 'grinder', 'welder', 'torch', 'soldering iron',
    'ladder', 'scaffolding', 'nail gun', 'staple gun', 'caulk gun', 'heat gun',
    'multimeter', 'stud finder', 'chalk line', 'plumb bob',
  ],
  'flooring': [
    'floor', 'tile', 'hardwood', 'laminate', 'vinyl', 'lvp', 'carpet',
    'underlayment', 'subfloor', 'floor adhesive', 'floor cleaner',
    'transition strip', 'threshold', 'baseboard', 'quarter round',
    'trowel', 'spacer', 'tile saw', 'grout float', 'sealer',
  ],
  'lighting': [
    'light', 'bulb', 'led', 'fluorescent', 'incandescent', 'halogen',
    'fixture', 'chandelier', 'pendant', 'sconce', 'recessed', 'can light',
    'under cabinet', 'track lighting', 'floodlight', 'spotlight', 'night light',
    'outdoor light', 'motion sensor light', 'photocell', 'ballast', 'troffer',
  ],
  'outdoor & garden': [
    'mulch', 'soil', 'potting mix', 'compost', 'fertilizer', 'seed', 'plant',
    'grass', 'lawn', 'sod', 'weed killer', 'herbicide', 'pesticide',
    'insecticide', 'hose', 'sprinkler', 'drip', 'irrigation', 'garden tool',
    'shovel', 'rake', 'hoe', 'trowel', 'wheelbarrow', 'edger', 'trimmer',
    'mower', 'blower', 'chainsaw', 'post', 'fence', 'gate', 'deck',
    'patio', 'stepping stone', 'landscape fabric', 'edging',
  ],
}

// Returns the section name (lowercase) that best matches the item name,
// or null if no match found.
function findMatch(itemName, keywordMap) {
  const lower = itemName.toLowerCase()
  for (const [sectionName, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return sectionName
    }
  }
  return null
}

// Given an item name and the list's sections array, returns the sectionId
// that best matches, or the 'Uncategorized' section id as fallback.
export function autoAssignSection(itemName, listType, sections) {
  const uncategorized = sections.find(s =>
    s.name.toLowerCase() === 'uncategorized',
  )?.id ?? sections[sections.length - 1]?.id

  if (!itemName?.trim()) return uncategorized

  let map = null
  if (listType === 'grocery') map = GROCERY_KEYWORDS
  if (listType === 'hardware') map = HARDWARE_KEYWORDS
  if (!map) return uncategorized

  const matchedSectionName = findMatch(itemName, map)
  if (!matchedSectionName) return uncategorized

  // Find the section whose name matches (case-insensitive)
  const matched = sections.find(
    s => s.name.toLowerCase() === matchedSectionName,
  )
  return matched?.id ?? uncategorized
}
