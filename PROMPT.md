Hi there AI Friend, I would like for you to build a design system. 

## Colours

### Intents

I like the concept of "Intent" instead of colour as it helps with whitelabeling.

Each intent maps to a set of colours – a single colour and a bunch of shades around that colour.

These intents are:

- Primary: matches the brand colour; should only be used for elements that represent the MAIN ACTION, e.g. submitting a form
- Secondary: a secondary brand colour; used more often than primary because it's not as "important"; can represent most non-primary actions, non-destructive actions, etc.
- Neutral: often grayscale, similar use case to Secondary
- Warning: an action that is reversible but significant; think "locking a credit card". It's reversible but it has a big impact!
- Danger: an action that is irreversible and significant – permanently deleting an entity
- Success: an action that indicates something was successful (often used for toasts)

### Saliency

Not all components will use the exact same set of colours; sometimes actions are "less destructive" than others. For example, hitting "Back" on a form. You will lose your changes, sure, but it doesn't need to be BRIGHT ORANGE. It could be a more dulled shade of orange.

I describe these levels of "boldness" as saliency.

- High saliency: used to draw attention to, often the main button in an area
- Mid saliency: somewhat important but often a "secondary" action, or the main action in a section but not on an entire page
- Low saliency: for all other uses

### Examples of colour + saliency

Here's some examples:

| Intent    | Saliency | Colour      |
|-----------|----------|-------------|
| Primary   | High     | #6cffe6     |
| Primary   | Mid      | #e2fffa     |
| Primary   | Low      | transparent |
| Secondary | High     | #a46bff     |
| Secondary | Mid      | #dbc4ff     |
| Secondary | Low      | transparent |

### The palette

Do NOT generate palettes; assume the dev will supply a full palette. But, assume that it has these shades:

- primary-50
- primary-100
- primary-200
- primary-300
- primary-400
- primary-500
- primary-600
- primary-700
- primary-800
- primary-900
- primary-950
- secondary-100
- secondary-200
- secondary-300
- secondary-400
- secondary-500
- secondary-600
- secondary-700
- secondary-800
- secondary-900
- neutral-50
- neutral-100
- neutral-200
- neutral-300
- neutral-400
- neutral-500
- neutral-600
- neutral-700
- neutral-800
- neutral-900
- neutral-950
- neutral-1000
- warning-100
- warning-200
- warning-300
- warning-400
- warning-500
- warning-600
- warning-700
- warning-800
- warning-900
- danger-100
- danger-200
- danger-300
- danger-400
- danger-500
- danger-600
- danger-700
- danger-800
- danger-900
- success-100
- success-200
- success-300
- success-400
- success-500
- success-600
- success-700
- success-800
- success-900

Where:
- 400 is the "main shade" of the intent
- 50/100 is the lightest shade of the intent
- 900/950/1000 is the darkest shade of the intent

Notice that:
- `secondary`, `warning`, `danger`, and `success` have shades 100, 200, 300, 400, 500, 600, 700, 800, 900
- `primary` has these shades as well as 50 and 950
- `neutral` has the shades of primary as well as 1000

### The colour system

Assume that these palette colours are given to you in the `oklch` colour space. This allows us to use oklch math to determine hover & active states instead of being forced to use shades from the palette.

The `h` value will remain consistent – only the `l` and `c` will be used to modify existing shades. These are relatively small values: 0.02 for `l` and 0.01 for `c`. So a hover state would be a delta of `0.02 l` and `0.01 c` from the original value, whereas an active state would be a delta of `0.04 l` and `0.02 c`.

On light themes, the values will decrease (darken). On dark themes, the values will increase (lighten).

### Design system tokens

Design system tokens lead to a better developer experience, in my opinion, as well as more functional communication between devs and designers.

The design system tokens "structure" should be like the following:

```json
{
    "color": {
        "surface": {
            "<intent>": {
                "<saliency>": {
                    "default": "oklch(...)",
                    "disabled": "oklch(...)"
                }
            }
        },
        "component": {
            "<intent>": {
                "<saliency>": {
                    "default": "oklch(...)",
                    "disabled": "oklch(...)"
                }
            }
        },
        "text": {
            "<intent>": {
                "<saliency>": "oklch(...)"
            }
        },
        "form": {
            "<state>": {
                "background": "oklch(...)",
                "border": "oklch(...)",
            }
        },
        "focus": {
            "<intent>": "oklch(...)"
        }
    },
}
```

## Element types

There are roughly 4 "types of elements":

1. Surfaces
2. Text
3. Form Controls
4. "Components"

### Surfaces

Surfaces are containers for other elements. Examples:

- Card
- Page
- Accordion
- Tabs
- Popover
- Tooltip
- "Notice" (banner elements, e.g. "Your last payment was declined." – often includes text, an icon, and action elements like buttons) – as well as "Toast"

Most of these will be using the neutral intent – Notice is an exception.

There are only 2 levels of saliency for surfaces: "high" and "low". Low is the default, which is the default neutral background, and borders (if applicable). "High" is a washed out colour similar to the "Mid" saliency for text and "components" (see below)

Most surfaces should only support the neutral intent because that is often what is needed. The Notice component can support other intents, though.

### Text

Text is plain text. Supports all levels of saliency and all intents.

Mid saliency is the default for all body text.

Lowest saliency is a very light colour which should only be used when there is some sort of alternative text to read. For example, when a button is disabled, it should have a tooltip explaining why it's disabled, and the button text itself can be very light.

High saliency is used for form control labels, headings.

Icon colours will match the corresponding text colours.

Another part of this document will cover typography.

### Form Controls

Form Controls include:

- text input
- checkboxes
- switches
- radio buttons
- sliders
- number inputs (e.g. with + and - icons)
- selects / comboboxes / autocompletes
- file upload
- toggle groups

Form controls do not need to support "intent" or "saliency". However, they do need to support some sort of a "state" to indicate if there is something incorrect (or explicitly correct) about them. Think: neutral state ; warning state (e.g. user is submitting a low value when the average is much higher) ; invalid state (maps to "danger" intent) ; explicitly valid state (maps to "success" intent)

### "Components"

This is the catch all for the other elements that are available. Examples include but are not limited to:

- Button
- Chip
- Badge
- Avatar
- Icon

These elements support all intents and all levels of saliency. Their colour schemes are identical – that is to say:

```
<Button intent='danger' saliency='high' />

<Chip intent='danger' saliency='high'>
```

Will render very similar elements! The following attributes would be shared between them:

- Text colour
- Icon colour (if applicable)
- Background colour (incl. hover + pressed states)

Regarding saliency:

- High saliency is very bold – i.e. the main colour of that intent's shades
- Mid saliency is more washed out – a pastel-ish shade of that intent
- Low saliency is a transparent background – but with a border

## Element states

All interactive elements must support a focus ring and a disabled state.

`aria-disabled` should be used instead of `disabled` as the former allows for keyboard navigation to that element.

Focus should be the same as the default state but with a focus ring. Note that focus can be combined with hover, active, and disabled too.

## Whitelabeling



## Actual implementation

### Components

The components to start:

- Chip
- Text
- Heading
- Card
- TextInput

### Tech stack

**vanilla-extract** for CSS
- Make use of recipes for an element's variants
- Use the "atoms" concept based on [sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/)
- Elements of the same "component type" should use shared recipes
    - e.g. Button and Chip as aforementioned have many similar attributes
- Make recipes and sprinkles **granular**

**base-ui** for the components
- This means the underlying framework is React 19.x
- Use the latest version (1.5.x)
- Use for all components that semantically match the ones I've described

### Avoid

Avoid the following technologies:
- shadcn
- shadcn/ui
- tailwind
- scss / sass

### Other notes

This design system is meant to be published as a package that I will use for my personal projects. I'm very tired of re-creating components in each project!