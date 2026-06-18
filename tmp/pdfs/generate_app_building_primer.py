from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUT = r"C:\Projects\truck-notes\output\pdf\app-building-primer.pdf"

PAGE_W, PAGE_H = letter
MARGIN_X = 0.62 * inch
MARGIN_Y = 0.58 * inch

INK = colors.HexColor("#161616")
MUTED = colors.HexColor("#6b6760")
GOLD = colors.HexColor("#b8843f")
GREEN = colors.HexColor("#386a55")
WASH = colors.HexColor("#f3efe6")
PANEL = colors.HexColor("#fffdf8")
LINE = colors.HexColor("#ded8cc")


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=30,
        leading=33,
        textColor=INK,
        alignment=TA_CENTER,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=20,
    )
)
styles.add(
    ParagraphStyle(
        name="PageTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=20,
        textColor=INK,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="Kicker",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=GOLD,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.8,
        leading=13.2,
        textColor=INK,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=MUTED,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="PrimerBullet",
        parent=styles["Body"],
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3.5,
    )
)
styles.add(
    ParagraphStyle(
        name="Term",
        parent=styles["Body"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10.5,
        textColor=INK,
        spaceAfter=0,
    )
)
styles.add(
    ParagraphStyle(
        name="Def",
        parent=styles["Small"],
        fontSize=8.1,
        leading=10.2,
        textColor=MUTED,
        spaceAfter=0,
    )
)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullets(items):
    flow = []
    for item in items:
        flow.append(Paragraph("- " + item, styles["PrimerBullet"]))
    return flow


def page(kicker, title, intro, items):
    flow = [p(kicker.upper(), "Kicker"), p(title, "PageTitle"), p(intro)]
    flow.extend(bullets(items))
    return flow


def glossary_table(rows):
    data = []
    for term, definition in rows:
        data.append([Paragraph(term, styles["Term"]), Paragraph(definition, styles["Def"])])
    table = Table(data, colWidths=[1.55 * inch, 5.42 * inch], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, 0), (-1, -1), 0.25, LINE),
            ]
        )
    )
    return table


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PANEL)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(WASH)
    canvas.roundRect(0.38 * inch, 0.35 * inch, PAGE_W - 0.76 * inch, PAGE_H - 0.7 * inch, 10, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.75)
    canvas.roundRect(0.38 * inch, 0.35 * inch, PAGE_W - 0.76 * inch, PAGE_H - 0.7 * inch, 10, fill=0, stroke=1)
    canvas.setFillColor(GOLD)
    canvas.rect(0.38 * inch, PAGE_H - 0.76 * inch, PAGE_W - 0.76 * inch, 0.05 * inch, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    footer = "Truck Notes app-building primer"
    canvas.drawString(MARGIN_X, 0.28 * inch, footer)
    canvas.drawRightString(PAGE_W - MARGIN_X, 0.28 * inch, f"{doc.page}")
    canvas.restoreState()


story = []

story += [
    Spacer(1, 1.05 * inch),
    p("App Building Primer", "CoverTitle"),
    p("A practical guide to app structure, mobile conventions, interaction patterns, and the vocabulary we are using while building Truck Notes.", "CoverSub"),
    Spacer(1, 0.28 * inch),
    p("Use this as a shared language sheet. It is not a rulebook. It is a way to make faster, cleaner decisions while we design.", "Body"),
    Spacer(1, 0.18 * inch),
    p("Core idea: an app is not a page with buttons. It is a workflow machine.", "Body"),
    Spacer(1, 0.22 * inch),
]
story += bullets(
    [
        "Primary job: create and send shift notes.",
        "Secondary job: manage staff, recipients, settings, and display preferences.",
        "Dangerous job: start a new day or reset data.",
        "Convenience job: change theme or other low-frequency preferences.",
    ]
)
story += [PageBreak()]

story += page(
    "Page 1",
    "Core App Concepts",
    "Good app design starts with the user's real task, not with decoration. The screen should answer what the user is doing now and what should happen next.",
    [
        "Ask what the user is trying to get done, what must be visible, what can be tucked away, and what must be impossible to miss.",
        "Give important workflows visual priority. Do not give every action equal weight.",
        "A primary shift-level action belongs near the shift context. That is why Start New Day belongs near Shift Date, not in the hamburger menu.",
        "Use menus for lower-frequency app controls, not daily workflow steps.",
        "Avoid text that explains the UI unless the user truly needs instruction. The interface should mostly explain itself through placement, labels, and state.",
    ],
)
story += [PageBreak()]

story += page(
    "Page 2",
    "App Structure",
    "Most app screens are built from repeated regions. Once you recognize the regions, decisions get easier.",
    [
        "Header: identity, current context, and app-level controls.",
        "Main content: the task the user is actively doing.",
        "Tabs or sections: sibling work areas such as Notes, Staff, and Closeout.",
        "Footer: persistent final or review actions such as Review Notes, Publish, or Email Notes.",
        "Menu: lower-frequency controls such as Settings, Night mode, account, help, and app details.",
        "Modal or gate: a temporary blocker when the app needs a decision before continuing.",
        "A good operational app should feel calm, dense, predictable, and hard to misuse.",
    ],
)
story += [PageBreak()]

story += page(
    "Page 3",
    "Current Conventions",
    "Modern mobile apps prioritize content and task flow over visible chrome. The common tradeoff is discoverability versus screen space.",
    [
        "Visible primary workflows beat hidden primary workflows.",
        "Hidden menus are acceptable for utility controls, but weaker for core navigation because hidden things are less discoverable.",
        "Tabs work well when there are only a few sibling sections and the user needs to move between them often.",
        "State controls such as toggles should show the resulting state after activation. Commands can close menus; toggles usually should not.",
        "Large touch targets, visible focus, readable contrast, and clear labels are not polish. They are baseline usability.",
        "Gestures should enhance, not replace, visible controls. If users cannot discover a gesture, it is not enough by itself.",
    ],
)
story += [PageBreak()]

story += page(
    "Page 4",
    "What Desirable Looks Like",
    "For Truck Notes, desirable means operationally useful first and visually tasteful second. The app should get out of the way of the shift.",
    [
        "Notes remain the star of the app.",
        "Staff and Closeout are accessible, but they should not compete with the note-taking workflow.",
        "Required fields should block sending, not casual reviewing.",
        "Settings can be protected, but display preferences such as Night mode should be reachable without a passcode.",
        "Errors should correct the path without feeling punitive. Shake, highlight, focus, and concise copy usually beat long warnings.",
        "Lists should alphabetize automatically when the user expects scanning, not chronology.",
        "Visual accents should clarify meaning, not create a second design system inside the same screen.",
    ],
)
story += [PageBreak()]

story += page(
    "Page 5",
    "Where Apps Are Going",
    "The direction is native-feeling web apps: installable, fast, forgiving, and polished enough that users do not think about the browser.",
    [
        "PWAs are increasingly expected to behave like apps: installable, cached, and usable from the home screen.",
        "Native-feeling inputs matter. Numeric fields should bring up numeric keyboards. Menus, sheets, and modals should feel familiar on iPhone.",
        "Personalization is becoming normal: theme, saved users, saved recipients, and remembered preferences.",
        "Visual trends are moving toward layered, translucent, glass-like materials, especially in Apple's post-2025 direction, but readability still wins.",
        "AI can help draft, summarize, validate, and route information. The best use is quiet assistance, not clutter.",
        "The practical future for this app is shared data, user identity, reliable sending, and cleaner management screens.",
    ],
)
story += [PageBreak()]

glossary_1 = [
    ("Primary action", "The main next action on a screen."),
    ("Primary shift-level action", "An action tied directly to the current shift or day, such as Start New Day."),
    ("Secondary action", "Useful, but not the main reason the screen exists."),
    ("Destructive action", "Deletes, resets, overwrites, or otherwise risks data loss; usually needs confirmation."),
    ("Gate", "A blocker before continuing, such as Add staff before sending notes."),
    ("Field", "An input area where the user enters or selects data."),
    ("Pill", "A compact rounded label or count, often used for status like 0 Staff / 2 Notes."),
    ("Chip", "A compact selectable item used for choices, filters, or quick options."),
    ("Toggle", "An on/off state control with immediate effect."),
    ("Command", "A one-time action such as Copy, Email, Delete, or Settings."),
    ("Modal", "A blocking dialog that interrupts the current screen until dismissed or completed."),
    ("Sheet", "A panel, often mobile-native, that slides up from the bottom."),
    ("Popover", "A small floating panel tied to a button or control."),
    ("Menu", "A compact list of actions or options."),
    ("Toast", "A temporary status message."),
]
story += [p("Glossary", "PageTitle"), p("Common terms we are using while designing Truck Notes.", "Body"), glossary_table(glossary_1), PageBreak()]

glossary_2 = [
    ("Tab", "A visible switch between sibling sections."),
    ("Segmented control", "A compact button group where one option is active."),
    ("Header", "The top app area containing identity, context, and app-level controls."),
    ("Footer", "The bottom action area, often used for persistent review or final actions."),
    ("Chrome", "The UI frame around content: nav, buttons, bars, and persistent controls."),
    ("State", "What the app currently knows: selected tab, theme, staff, notes, and form values."),
    ("Persist", "Save state so it survives closing and reopening."),
    ("Validation", "Checking whether input is required, valid, or ready to send."),
    ("Required field", "A field needed before a final action can proceed."),
    ("Focus", "The currently active input or control."),
    ("Touch target", "The tappable area of a control."),
    ("Affordance", "A visual clue that something can be used."),
    ("Signifier", "The icon, label, or shape that communicates what an affordance does."),
    ("Hierarchy", "The visual order of importance on a screen."),
    ("Density", "How much useful interface fits on the screen."),
    ("Progressive disclosure", "Hiding advanced or low-frequency options until needed."),
    ("PWA", "A web app that can be installed and launched like an app."),
    ("Service worker", "The PWA worker that manages caching and update behavior."),
    ("Cache busting", "Changing version/cache names so users receive the new app build."),
]
story += [
    p("Glossary Continued", "PageTitle"),
    glossary_table(glossary_2),
    Spacer(1, 0.16 * inch),
    p("Sources", "PageTitle"),
    p("Nielsen Norman Group: Basic Patterns for Mobile Navigation - https://www.nngroup.com/articles/mobile-navigation-patterns/", "Small"),
    p("Nielsen Norman Group: Toggle-Switch Guidelines - https://www.nngroup.com/articles/toggle-switch-guidelines/", "Small"),
    p("W3C: Web Content Accessibility Guidelines 2.2 - https://www.w3.org/TR/WCAG22/", "Small"),
    p("The Verge: Apple's Liquid Glass design overview - https://www.theverge.com/news/682636/apple-liquid-design-glass-theme-wwdc-2025", "Small"),
]

doc = SimpleDocTemplate(
    OUT,
    pagesize=letter,
    leftMargin=MARGIN_X,
    rightMargin=MARGIN_X,
    topMargin=0.86 * inch,
    bottomMargin=0.58 * inch,
)
doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print(OUT)
