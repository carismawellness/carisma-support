"""
Create all 48 Carisma Slimming email templates in Klaviyo.
Raw personal-email style — no fancy design, just text like emailing a friend.
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("KLAVIYO_PRIVATE_API_KEY")
BASE_URL = "https://a.klaviyo.com/api/templates/"
HEADERS = {
    "Authorization": f"Klaviyo-API-Key {API_KEY}",
    "accept": "application/vnd.api+json",
    "content-type": "application/vnd.api+json",
    "revision": "2025-01-15"
}

def wrap_html(body_content):
    """Wrap email body in minimal personal-email HTML — no design, just text."""
    return f"""<html>
<head>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 16px; line-height: 1.6; color: #333333; }}
p {{ margin: 0 0 16px 0; }}
strong {{ font-weight: 600; }}
.ps {{ color: #666666; font-size: 14px; margin-top: 24px; }}
.sig {{ margin-top: 24px; }}
</style>
</head>
<body>
{body_content}
</body>
</html>"""

def sig():
    return '<p class="sig">With you every step,<br>Katya</p>'

def ps(text):
    return f'<p class="ps">P.S. {text}</p>'

# All 48 emails: (name, subject_line, body_paragraphs)
EMAILS = [
    # --- EMAIL 1 ---
    {
        "name": "CS Email 01 - The one thing I wish someone told me",
        "body": f"""
<p>When I started this method myself, I thought success meant doing it perfectly from day one.</p>
<p>That's the biggest lie the diet industry ever sold you.</p>
<p>Here's what actually matters: this method was built for real life. Not a fantasy version of your life where you meal-prep on Sundays, never eat pastizzi, and wake up at 6am for a jog. Your actual life. The one with late dinners, busy mornings, and that nanna who pushes seconds on you.</p>
<p>You don't need to overhaul everything this week. You don't need to understand all the details yet. You don't need to be perfect.</p>
<p>Your only job this week is to learn your rhythm.</p>
<p>That means: follow the structure we gave you. Notice what feels easy. Notice what feels hard. Whatever you notice — that's useful. It's not about getting it right. It's about getting to know how you work.</p>
<p>The people who get the best results in this program aren't the ones who start the strongest. They're the ones who keep showing up, even messily.</p>
<p>So breathe. You're exactly where you need to be.</p>
<p><strong>Your one job this week: Follow the structure, notice your rhythm, and let yourself be imperfect at it.</strong></p>
{sig()}
{ps("If you're feeling anxious right now, that's normal. Everyone in this program felt exactly the same on day one. By Friday, most of them felt different.")}"""
    },
    # --- EMAIL 2 ---
    {
        "name": "CS Email 02 - Your secret weapon is already in your fridge",
        "body": f"""
<p>I'm going to give you the simplest tool in the entire program.</p>
<p>Sparkling water.</p>
<p>I know. Not exactly glamorous. But here's why it's your best friend for the next few weeks:</p>
<p>During morning fasting, hunger comes in waves. Not a constant roar, but a wave. It builds, peaks, and then it passes. Every time. The trick is getting through the peak. Sparkling water does that. The carbonation creates a feeling of fullness that bridges you right through the wave.</p>
<p>Here's your week one strategy:</p>
<p>One glass when you wake up. One mid-morning. One more whenever hunger shows up.</p>
<p>That's it. Three glasses of sparkling water. That's your entire strategy this week.</p>
<p>I use this myself. Still do. There's a bottle on my desk right now.</p>
<p>Don't overthink the rest. We'll get there. Right now, you're building the foundation, and the foundation is rhythm.</p>
<p><strong>This week's move: three sparkling waters before your first meal. That's the whole plan.</strong></p>
{sig()}
{ps("If plain sparkling water feels boring, squeeze half a lemon in. Zero points. Changes the game.")}"""
    },
    # --- EMAIL 3 ---
    {
        "name": "CS Email 03 - Why you're not actually hungry at 9am",
        "body": f"""
<p>Let me tell you something that changed how I think about hunger.</p>
<p>That growling stomach at 9am? Most of the time, it's not real hunger. It's a habit. Your body releases a hormone called ghrelin at the times it <em>expects</em> food. If you've eaten breakfast at 9am for 20 years, ghrelin shows up at 9am like clockwork. It's not saying "you need food." It's saying "this is when we usually eat."</p>
<p>Here's the part most people don't know: ghrelin comes in waves. It peaks for about 10-15 minutes, then it fades. It doesn't just keep climbing forever. It rises, crests, and passes.</p>
<p>So when that wave hits, here's what to do. Drink your sparkling water. Wait ten minutes. Do something. Walk to the kitchen for water, check your phone, step outside for air. By the time ten minutes pass, the wave is gone.</p>
<p>And here's the real science: your body adapts to new eating times in about 7-14 days. That means the ghrelin clock resets. By the end of this week or next, mornings will feel calmer. Not because you're tougher. Because your biology adjusted.</p>
<p>If you're in days 4-7 right now, you might already be noticing it getting easier. That's not imagination. That's adaptation.</p>
<p><strong>Remember: hunger is a wave, not a wall. Let it pass.</strong></p>
{sig()}
{ps("If mornings still feel brutal after two full weeks, tell your clinic. We adjust the plan. We never ask you to suffer through it.")}"""
    },
    # --- EMAIL 4 ---
    {
        "name": "CS Email 04 - The 3-word rule that changed everything",
        "body": f"""
<p>Last week someone in the program messaged the clinic in a panic.</p>
<p>"I ate pastizzi at 10am. I ruined everything."</p>
<p>No. They didn't.</p>
<p>Here's the rule that changed my own relationship with food. Three words:</p>
<p><strong>Return at next meal.</strong></p>
<p>That's it. Had pastizzi for breakfast? Return at lunch. Ate too much at dinner? Return tomorrow. Stayed out late, ate everything on the table? Return at your next structured meal.</p>
<p>You didn't break the system. You had a moment. The system was designed for moments like this. One meal doesn't undo days of consistency. What undoes progress is the spiral that comes after: "Well, I already ruined today, might as well eat whatever tonight... and tomorrow I'll restart on Monday..."</p>
<p>That spiral is the real enemy. Not the pastizzi.</p>
<p>The skill you're building isn't perfection. It's the return. Every time you come back to structure after a slip, you're training the most important muscle in this entire program.</p>
<p>Research is very clear on this: people who learn to recover from slip-ups quickly lose more weight long-term than people who start strong but collapse after one mistake.</p>
<p><strong>Your new rule: return at next meal. Always. No guilt. No restart. Just return.</strong></p>
{sig()}
{ps("I eat pastizzi. Not daily, but I eat them. The method still works. Because I return.")}"""
    },
    # --- EMAIL 5 ---
    {
        "name": "CS Email 05 - The 4pm crash isn't about willpower",
        "body": f"""
<p>If you've been hitting a wall around 3-4pm, reaching for biscuits, chocolate, anything sweet, I have good news.</p>
<p>It's not a willpower problem. It's a lunch problem.</p>
<p>Here's what's happening in your body. Around 1-3pm, your cortisol (stress hormone) naturally dips. It's a built-in part of your daily rhythm. Everyone gets it. At the same time, if your lunch was mostly carbs — bread, pasta, rice — without much protein, your blood sugar spikes and then crashes right into that cortisol dip.</p>
<p>The result? A double hit of low energy and intense sugar cravings. Your body screams for a quick fix. You reach for chocolate. Not because you're weak. Because your biology is asking for fast energy.</p>
<p>The fix is surprisingly straightforward.</p>
<p>One palm-sized portion of protein at lunch. Chicken, fish, eggs, Greek yoghurt, whatever you like. Protein slows the blood sugar rise and keeps you steady through the afternoon. Not through willpower. Through biochemistry.</p>
<p>Tomorrow, try it. Add a palm of protein to whatever you're having for lunch. Then notice what happens at 4pm.</p>
<p><strong>The fix: one palm of protein at lunch prevents the afternoon crash. Not willpower. Protein.</strong></p>
{sig()}
{ps("If you're already eating protein at lunch and still crashing, check your liquid points. Sweet coffees and juices in the morning can trigger the same blood sugar rollercoaster.")}"""
    },
    # --- EMAIL 6 ---
    {
        "name": "CS Email 06 - Friday night went off the rails",
        "body": f"""
<p>Let me tell you about a Friday that did not go according to plan.</p>
<p>It started fine. Morning: sparkling water, coffee, clean. Lunch: protein, structure, sorted.</p>
<p>Then the afternoon happened. Work ran late. Plans changed. By 7pm we weren't eating at home — we were at a cousin's place in Sliema, there was ftira and gbejniet already on the table, someone opened a second bottle of wine before I sat down, and dinner ended up being three hours of food I hadn't planned for.</p>
<p>No tracking. No structure. Just Friday.</p>
<p>Here's what I did. Nothing.</p>
<p>Not that night. That night, I enjoyed it. And Saturday morning, I woke up and had sparkling water, waited for my usual first meal time, and returned to structure.</p>
<p>That's it. That's the whole story.</p>
<p>There's no emergency protocol for a Friday night that went sideways. There's no recovery plan, no damage-control strategy, no punishing Sunday that makes up for it. There's just Saturday morning, showing up as normal.</p>
<p>The mistake most people make is treating Saturday as a day of penance — skipping meals to "balance it out," or spiralling into a second day of unstructured eating because yesterday's already lost anyway.</p>
<p>Both of those are worse than the Friday.</p>
<p>Saturday morning, you wake up. Sparkling water. Your first meal at the usual time. Normal rhythm. That's your reset. A Friday doesn't undo a week. Saturday morning is where the week continues.</p>
<p><strong>A Friday that went sideways only costs you one Friday. Saturday morning decides the rest.</strong></p>
{sig()}
{ps("Ftira and wine with family in Sliema on a Friday. Not something I'm apologising for. Not something you should either.")}"""
    },
    # --- EMAIL 7 ---
    {
        "name": "CS Email 07 - The breakfast myth that kept you stuck",
        "body": f"""
<p>You've heard it your whole life. Your mother said it. Doctors said it. The cereal box said it.</p>
<p>"Breakfast is the most important meal of the day."</p>
<p>Here's the truth: that phrase was popularized by cereal companies in the early 1900s to sell more product. It's marketing. Not science.</p>
<p>When researchers actually tested this, the results were clear. Multiple studies found no metabolic advantage to eating breakfast. Your body burns energy regardless of when you eat your first meal. Skipping breakfast does not cause weight gain. The data simply doesn't support the myth.</p>
<p>What does matter is total intake across the day and how you distribute your protein. That's it. Timing your first meal a few hours later doesn't slow your metabolism. It doesn't make you store fat. It doesn't harm your health.</p>
<p>Now, I know this creates a different kind of pressure. Family. Your mother insisting you'll faint. Colleagues asking why you're not eating. That pressure is real.</p>
<p>But here's what you can say: "I eat later in the morning now. It works for me." You don't need to explain the science. You don't need permission.</p>
<p>Most people adapt to morning fasting within 7-14 days. After that, mornings feel natural. Calm, even. You're likely already feeling it.</p>
<p><strong>The myth: breakfast is essential. The truth: when you eat matters less than what and how much.</strong></p>
{sig()}
{ps('If someone pressures you about skipping breakfast, smile and say "my doctor put me on a plan." That ends the conversation every time.')}"""
    },
    # --- EMAIL 8 ---
    {
        "name": "CS Email 08 - The Sunday reset you'll actually keep",
        "body": f"""
<p>Here's what most people do after a social weekend.</p>
<p>Sunday night guilt hits. The internal monologue starts: "Tomorrow I'm starting fresh. Perfectly. No mistakes. Clean eating all week."</p>
<p>By Tuesday, it's already falling apart. Because perfection always falls apart.</p>
<p>Here's what I do instead. Five minutes. No drama.</p>
<p><strong>One: Set out your water glass tonight.</strong><br>Not tomorrow morning when you're rushing. Right now. Put it on the kitchen counter. That glass is your first decision already made. You'll see it when you wake up and drink it before you do anything else. It sounds trivial. It isn't. The morning you do this is measurably different from the morning you don't.</p>
<p><strong>Two: Check what protein is in the fridge.</strong><br>Not shop, not prep — just check. Eggs? Leftover chicken? Some gbejniet? You're not planning a meal, you're just knowing what's there. That awareness is enough. When lunch comes, you won't be standing in front of an empty fridge reaching for crackers because there's nothing else.</p>
<p><strong>Three: Mentally release the weekend.</strong><br>Whatever happened, happened. The Friday wine. The extra portions at Sunday lunch. The biscuits someone brought to the office on Saturday. It's done. You're not carrying it into Monday. You're not running it off. You're not restricting to balance it. You're just... putting it down.</p>
<p>Those three things take five minutes. They're not a restart. They're a return.</p>
<p><strong>Your Sunday reset: water glass out, protein checked, weekend released. Five minutes. That's it.</strong></p>
{sig()}
{ps("If you're reading this after a weekend that went completely sideways, good. You're here. That means you're returning. That's the whole skill.")}"""
    },
    # --- EMAIL 9 ---
    {
        "name": "CS Email 09 - The number on the scale lied to you",
        "body": f"""
<p>If you weighed yourself this morning and felt your stomach drop, read this carefully.</p>
<p>Your weight can fluctuate 1-2 kilos in a single day. Not because you gained fat. Because of water, salt, hormones, and food sitting in your digestive system. That's it.</p>
<p>Here's why this matters: to gain even one kilo of actual fat, you'd need to eat roughly 7,700 extra calories above what your body burns. In one day. That's physically almost impossible.</p>
<p>So what's happening when the scale jumps overnight?</p>
<p>Sodium. A salty dinner causes your body to hold an extra liter of water. That's a full kilo right there. Glycogen. Every gram of stored carbohydrate binds 3-4 grams of water. Eat more carbs than usual, and water weight follows. Hormones. Hormonal fluctuations can add 1-3 kilos of water retention. This is normal and temporary.</p>
<p>The daily number is noise. The weekly trend is signal.</p>
<p>Here's what I recommend: weigh yourself if you want. But look at the 7-day average, not today's number. If the average is trending down over weeks, you're losing fat. Even if this morning's number went up.</p>
<p><strong>Daily weight = noise. Weekly trend = signal. Trust the trend, not the morning number.</strong></p>
{sig()}
{ps("If you're experiencing hormonal water retention and the scale jumped, don't even look at it. Come back in a few days. The water will drop and you'll see the real number underneath.")}"""
    },
    # --- EMAIL 10 ---
    {
        "name": "CS Email 10 - Do this one thing before you read this",
        "body": f"""
<p>Before you read anything else, I want you to do one thing.</p>
<p>Go find the jeans you wore five weeks ago — the ones you put on the day you started this programme. Put them on right now. Or if you can't do it this second, make a note to do it tonight.</p>
<p>Don't step on a scale. Don't calculate anything. Just put them on and notice.</p>
<p>Not "are they a size smaller." Just: do they fit differently? Is the waistband easier? Is there more room than you remember? Is there less... fight?</p>
<p>This matters more than the number you've been watching all week.</p>
<p>Here's why. Fat and muscle have different densities. You can lose centimetres — real, measurable, visible centimetres — while the scale barely moves. The jeans tell you something the scale can't. They tell you what's actually happening to your body, not what's happening to your water retention, your salt intake, your digestion.</p>
<p>Five weeks in, most people notice something different in how clothes fit before they notice it in the mirror. The mirror is the last thing to update. The jeans are usually first.</p>
<p>Has food been a bit quieter this week? Not gone — just quieter? Less of that constant mental negotiating around every meal? That's not nothing. That's actually the first sign the method is working at a deeper level — when food stops being the main character of your day.</p>
<p>Check the jeans. Notice what you find. That's your real evidence.</p>
<p><strong>The jeans don't lie. The scale does. Check the jeans.</strong></p>
{sig()}
{ps("If you genuinely can't tell a difference in the jeans, message the clinic. We'll look at what's happening and adjust. Five weeks of consistent effort should produce something you can feel.")}"""
    },
    # --- EMAIL 11 ---
    {
        "name": "CS Email 11 - How to order at a Maltese restaurant",
        "body": f"""
<p>You're going to dinner tonight. Or this weekend. And there's a part of your brain already calculating, worrying, planning to "be good."</p>
<p>Stop. You don't need to dread restaurants. You need a formula.</p>
<p>Here it is. Four steps.</p>
<p><strong>Step one:</strong> Order protein first. Grilled, not fried. Fish, chicken, meat, whatever you like. This anchors your meal.</p>
<p><strong>Step two:</strong> Add vegetables or salad. Ask for a side if the main doesn't come with one. This gives you volume.</p>
<p><strong>Step three:</strong> Choose one carb. Bread OR pasta OR rice OR potatoes. Not all of them. Just one. Enjoy it fully.</p>
<p><strong>Step four:</strong> Skip the extras you didn't ask for. The bread basket that appears automatically. The extra butter. The third top-up of olive oil. These are sneaky points that don't add satisfaction.</p>
<p>Wine? Count it as part of your dinner points. Have a glass. Enjoy it.</p>
<p>Dessert? If you really want it, share one. If you don't, skip it without guilt.</p>
<p>That's it. You just ate at a restaurant, enjoyed your evening, and stayed on plan. No suffering. No missing out. No anxiety.</p>
<p><strong>The restaurant formula: protein first, vegetables, one carb, skip the extras. Then enjoy.</strong></p>
{sig()}
{ps("You don't need to announce your plan to the table. Just order. Nobody notices when you skip the bread basket. They're too busy eating theirs.")}"""
    },
    # --- EMAIL 12 ---
    {
        "name": "CS Email 12 - Why your body is fighting you right now",
        "body": f"""
<p>If your weight loss has slowed down or paused this week, I need you to read this before you panic.</p>
<p>This is one of the most important emails I'll send you.</p>
<p>Around weeks 5-6, many people hit a wall. The scale that was moving steadily suddenly stops. Or barely moves. And the thought hits: "It stopped working. I knew it."</p>
<p>It didn't stop working. Your body is recalibrating.</p>
<p>Here's the science. When you lose weight, your body notices and makes adjustments. It slightly reduces your metabolic rate, increases hunger signals, and becomes more efficient with energy. Researchers call this adaptive thermogenesis. It's not your body failing. It's your body being smart.</p>
<p>Studies have tracked this carefully. The people who lose weight fastest tend to have the biggest metabolic slowdowns. But people who lose weight slowly and steadily — like you're doing — preserve their metabolic rate much better. Your approach is protecting you from the crash that ruins most diets.</p>
<p>So what do you do? Not what you think.</p>
<p>Do NOT restrict more. Don't cut your points. Don't skip meals. Don't add extra exercise as punishment. All of that backfires and drives metabolic rate down further.</p>
<p>Instead: keep your structure. Trust the rhythm. Your clinic will review your targets and make small adjustments if needed.</p>
<p><strong>A plateau at week 5-6 is the signal, not the warning. It means your body is taking stock of what you've built. Keep the structure. The next drop will surprise you.</strong></p>
{sig()}
{ps("The people who push through this phase without panicking are the ones who see the biggest results in months 2 and 3. You're building something that lasts. Stay the course.")}"""
    },
    # --- EMAIL 13 ---
    {
        "name": "CS Email 13 - This is probably why your progress slowed",
        "body": f"""
<p>You're doing everything right. Protein at lunch. Structure in the evening. Timing feels automatic now.</p>
<p>But the scale isn't moving the way it should.</p>
<p>Before you blame yourself, check your drinks.</p>
<p>Here's something most people don't realise: your brain doesn't register liquid calories as food. You drink a latte, and your hunger stays exactly the same as if you'd had water. But your points budget just lost 150 points.</p>
<p>A glass of juice? 120 points. That "healthy" smoothie from the shop? Over 300 points. Gone. And you're still just as hungry.</p>
<p>This is what I call the liquid points trap. You're spending your budget on things that don't fill you up, don't reduce your appetite, and don't even feel like eating.</p>
<p>And there's a very specific one I see all the time in Malta: the morning cappuccino from the pastizzi shop. Milk, two sugars, maybe a syrup if it's the fancier bar in town. That's not a drink. That's 180 points in a paper cup — before you've eaten a single thing.</p>
<p>For the next week, try this: black coffee, plain tea, water, sparkling water. That's your drink list. Save your points for food that actually fills you.</p>
<p>You don't need to do this forever. But try it for one week and watch what happens.</p>
<p><strong>One small swap in what you drink can unlock what the scale's been hiding.</strong></p>
{sig()}
{ps("If you&#39;re someone who needs that morning latte, I get it. Try it black for five days. Most people stop missing the milk by day three.")}"""
    },
    # --- EMAIL 14 ---
    {
        "name": "CS Email 14 - How to handle the family food pressure",
        "body": f"""
<p>If you've sat at a Maltese family table and heard "have some more" or "you're not eating enough" — you know.</p>
<p>It comes from love. But it can feel like sabotage.</p>
<p>Here's what I've learned: don't try to explain the method. Don't try to convert anyone. Don't defend your choices. It never works. The more you explain, the more they push back. You're not going to convince your mother that skipping breakfast is fine, and you don't need to.</p>
<p>Instead, use one sentence:</p>
<p>"I had a big lunch, I'm not that hungry yet."</p>
<p>That's it. Then change the subject. Ask about your cousin's wedding. Compliment the food. Move on.</p>
<p>You are not responsible for making everyone understand your choices. You're responsible for quietly building a structure that works for you.</p>
<p>The people who love you will notice the results. That conversation is much easier to have.</p>
<p><strong>You don't owe anyone an explanation. You owe yourself consistency.</strong></p>
{sig()}
{ps("This works for colleagues, friends, and well-meaning aunties too. One sentence. Then redirect.")}"""
    },
    # --- EMAIL 15 ---
    {
        "name": "CS Email 15 - If you eat one more chicken breast you'll scream",
        "body": f"""
<p>Right around the two-month mark, I start getting the same message.</p>
<p>"I'm so bored I could cry. Same thing every day."</p>
<p>Not bored with the method. Bored with the food. Bored with chicken. Bored with the routine that used to feel like structure and now feels like a sentence.</p>
<p>This is not a sign that something is wrong. This is what month two feels like. The novelty wore off. The early results were exciting. Now it's just Tuesday, and you're staring at a chicken breast again.</p>
<p>Here's how to fix it without blowing up what's working.</p>
<p>You don't need new recipes. You need new proteins. Swap one thing at a time and the whole meal changes.</p>
<p>Start with what Malta already gives you. Gbejniet — fresh Maltese goat cheese — is a legitimate, high-protein food that most people don't think to count. Slice it over a salad. Eat it with tomatoes and olive oil. It's been on this island for centuries for a reason.</p>
<p>Lampuki, when it's in season, is one of the best protein sources you'll find. Fresh, cheap at the market, done in ten minutes. If it's not lampuki season, any fresh fish from the market does the same job.</p>
<p>Ravjul with ricotta counts. The ricotta is protein. Don't write it off because it's pasta.</p>
<p>Eggs. Six different ways, all under five minutes. Canned tuna. Greek yoghurt. Beans and lentils — cheaper than chicken and they fill you up longer.</p>
<p>You don't need 47 new recipes. You need four or five proteins you genuinely like and the confidence to rotate them.</p>
<p><strong>Month two boredom is the signal to rotate proteins, not to abandon structure. Start with gbejniet.</strong></p>
{sig()}
{ps("The local market on a Saturday morning is worth it. Fresh lampuki when it's in season. Whatever the fisherman recommends. That's a meal worth looking forward to.")}"""
    },
    # --- EMAIL 16 ---
    {
        "name": "CS Email 16 - You changed more than you think this month",
        "body": f"""
<p>I want you to stop for a moment.</p>
<p>Not to count points. Not to check the scale. Just to look back.</p>
<p>Eight weeks ago, you started something. And in those eight weeks, here's what actually happened:</p>
<p>You sat through a family dinner and didn't spiral afterward.<br>You had a weekend where things went off track, and you came back on Monday instead of quitting.<br>You survived a plateau without throwing the whole thing away.<br>You handled social pressure without explaining yourself to everyone.<br>You kept going on days when you didn't feel like it.</p>
<p>Most people would have quit. You didn't. That's not motivation. That's a different kind of person.</p>
<p>The old version of you would have quit after the first bad weekend. Or the first plateau. Or the first family dinner that felt like too much.</p>
<p>But you didn't.</p>
<p>You probably haven't given yourself credit for that. So let me say it clearly: what you've built in eight weeks is more durable than anything a two-week crash diet ever gave you.</p>
<p>I'm proud of you. Genuinely.</p>
<p><strong>You're not just losing weight. You're becoming someone who handles life without losing their structure.</strong></p>
{sig()}
{ps("Write down one thing that's different now compared to eight weeks ago. Not a number. Something you notice. Something that feels different. Keep it somewhere you can find it in eight more weeks.")}"""
    },
    # --- EMAIL 17 ---
    {
        "name": "CS Email 17 - Where most people quit",
        "body": f"""
<p>Around this stage, things go quiet.</p>
<p>The excitement doesn't show up in the morning the way it used to. You're not dreading the structure — you're just doing it. No fanfare. No milestone feeling. Just Tuesday, and then Wednesday, and then Thursday.</p>
<p>That stillness feels suspicious. Like something is wrong. Like maybe the programme stopped working, or maybe you stopped caring, or maybe this is where you're supposed to feel something more dramatic.</p>
<p>It isn't.</p>
<p>What you're feeling right now is what success looks like when it stops being an event and starts being a life.</p>
<p>In the early weeks, following structure felt like an achievement. Now it feels like breakfast. That shift — from effort to automatic — is the whole point. That's what we've been building toward.</p>
<p>Quiet is not stalling. Quiet is arriving.</p>
<p>The people who plateau around this point aren't the ones who feel flat. They're the ones who interpret flat as failure and reach for something more exciting. They restart. They try a different plan. They chase the feeling of beginning again.</p>
<p>You don't need the feeling of beginning again. You are already there.</p>
<p><strong>When it stops feeling hard, it doesn't mean you stopped working. It means the work is done.</strong></p>
{sig()}
{ps("If the method feels ordinary right now, that's the highest compliment you can pay it. Ordinary means it fits your life. That's what you came here for.")}"""
    },
    # --- EMAIL 18 ---
    {
        "name": "CS Email 18 - The sentence that changed how I think about slip-ups",
        "body": f"""
<p>"I had pizza for lunch, so the day is ruined. I'll start again tomorrow."</p>
<p>If that sounds familiar, you're not alone. This is the most common pattern I see. And it's the single biggest enemy of long-term weight loss.</p>
<p>It's called all-or-nothing thinking. One slip becomes permission to abandon the entire day. Research actually has a name for it — the "what-the-hell effect." Studies show that people who believe they've blown their diet end up eating significantly more than people who weren't dieting at all. The belief that it's ruined causes more damage than the pizza ever did.</p>
<p>Here's the sentence that broke this pattern for me:</p>
<p>"What would I do if this happened to a friend?"</p>
<p>If a friend called you and said "I had pizza at lunch," you wouldn't tell them the day is ruined. You'd say "so what? Have a normal dinner and move on."</p>
<p>Give yourself the same advice.</p>
<p>One meal is one meal. The day isn't ruined. The week isn't ruined. Your progress isn't erased. You just had pizza.</p>
<p><strong>Next meal, back to structure. That's the whole rule.</strong></p>
{sig()}
{ps("I used to be the worst at this. Pizza on Tuesday meant I'd write off everything until the following Monday. I lost years to that thinking. One sentence fixed it.")}"""
    },
    # --- EMAIL 19 ---
    {
        "name": "CS Email 19 - Your 3pm slump is telling you something",
        "body": f"""
<p>Picture a row of dominoes.</p>
<p>You can't knock over the last one without the first one falling. And you can't shore up the last one without looking back to the beginning of the chain.</p>
<p>Your day works the same way.</p>
<p><strong>Morning:</strong> You hold the fast. Blood sugar stays stable. Hunger hormones stay quiet. You arrive at lunch in control — making a choice, not a reaction.</p>
<p><strong>Lunch:</strong> A proper meal. One to two palms of protein. Vegetables. A carb if you want one. The plate is built. You feel full.</p>
<p><strong>Afternoon:</strong> Because lunch held, the 3-4pm window is calm. No crash. No fog. No emergency reach into the biscuit cupboard. You make it to dinner without detours.</p>
<p><strong>Evening:</strong> Because the afternoon was clean, dinner is moderate. Not ravenous. Not compensating. Just eating.</p>
<p><strong>Next morning:</strong> You wake up in rhythm. The fast feels easy. The first domino is steady again.</p>
<p>When people tell me their evenings are hard, I don't look at the evening. I look at lunch. Almost always, the afternoon broke because lunch protein was too low. The domino fell in the middle of the chain, and everything after it followed.</p>
<p>You can't fix the end of the day at the end of the day. You fix it at 1pm.</p>
<p><strong>Every good morning starts the night before. Every good evening starts at lunch.</strong></p>
{sig()}
{ps("Lunch protein isn't about muscle. It's about who makes your food decisions at 9pm. That person is running on what you ate at 1pm.")}"""
    },
    # --- EMAIL 20 ---
    {
        "name": "CS Email 20 - The scale hasn't moved",
        "body": f"""
<p>The scale hasn't budged in a week.</p>
<p>I know exactly what you're thinking. "It stopped working."</p>
<p>It didn't.</p>
<p>A one-week stall is not a plateau. A real plateau is three or more weeks with no trend change, while you're consistently following structure. One week of no movement is just... normal.</p>
<p>Here's what can mask fat loss on the scale without anything being wrong:</p>
<p>Water retention — especially around hormonal shifts, or after a high-salt meal.<br>Hormonal fluctuations — your body holds and releases water in patterns.<br>Sleep quality — one bad week of sleep can cause temporary water retention.<br>New exercise — muscles hold water during recovery. This actually means something good is happening.<br>Timing of weigh-in — different time, different result.</p>
<p>Your body runs on its own schedule, not yours. It drops weight in clusters, not straight lines. A week of nothing, then two kilos gone in three days. That is not failure and recovery. That is just how this works.</p>
<p>The trend matters. Not the day.</p>
<p>If you're following structure — timing, protein, points — the results are coming. Your body just hasn't shown you yet.</p>
<p><strong>Keep going. The scale catches up to consistency.</strong></p>
{sig()}
{ps("Weigh yourself at the same time each week. Morning, after bathroom, before eating. Compare week to week, not day to day. That's the only number that tells you something real.")}"""
    },
    # --- EMAIL 21 ---
    {
        "name": "CS Email 21 - Festa buffet survival",
        "body": f"""
<p>Festa season. Buffets. Tables covered in pastizzi, bread, desserts, and everything your points budget didn't plan for.</p>
<p>Here's how to enjoy it without it turning into a three-day spiral.</p>
<p><strong>Before you go:</strong> Have a high-protein lunch. This is the single most important thing you can do. Arriving hungry to a buffet is like going grocery shopping on an empty stomach. Everything looks irresistible.</p>
<p><strong>When you arrive:</strong> Don't start eating immediately. Get a drink. Say hello. Let the urgency pass.</p>
<p><strong>At the buffet:</strong> Scan for protein first — grilled meat, fish, cheese. Put that on your plate. Add salad or vegetables if they're there. Then choose ONE starchy or indulgent thing. One. Not three.</p>
<p><strong>Eat one plate.</strong> Enjoy it. Sit down. Have a conversation. Don't go back for grazing. Grazing is where the damage happens — not the plate.</p>
<p><strong>After:</strong> Return to structure at your next meal. Not Monday. Not tomorrow. Next meal.</p>
<p>You don't have to avoid the festa. You don't have to bring your own food. You just need a plan before you walk in.</p>
<p><strong>Arrive fed. Scan for protein. One plate. Move on.</strong></p>
{sig()}
{ps("The goal isn't to be the person refusing food at the festa. It's to be the person who enjoys one plate and doesn't think about it for the rest of the weekend.")}"""
    },
    # --- EMAIL 22 ---
    {
        "name": "CS Email 22 - They keep bringing chips home",
        "body": f"""
<p>One of the most common things I hear — and almost nobody puts it in the subject line of an email.</p>
<p>Someone in your household brings home things you're trying not to eat. They say you look fine the way you were. They order pizza on Saturday because it's Saturday. They don't understand why you're not having toast with them in the morning.</p>
<p>They're not trying to sabotage you. Most of the time, they don't even realise it's happening.</p>
<p>But the friction is real, and it can make the programme feel much harder than it needs to be.</p>
<p>A few things that actually help:</p>
<p><strong>You don't need their participation. You need their neutrality.</strong> You're not asking them to join the programme. You're asking them not to offer you the biscuits every evening. That's a small request. Frame it that way: "I'm not asking you to change what you eat. I'm asking you not to put it in front of me." Most people, when asked clearly, will do this.</p>
<p><strong>Keep your own version of satisfying food visible.</strong> If the counter has fruit, good cheese, something you genuinely like — you're less likely to reach for what they're having. Out of sight, out of mind works for what you're trying to avoid. It also works for what you want to choose instead.</p>
<p><strong>If they say "you looked fine before," here's what that usually means:</strong> They loved you before. They're slightly uncertain about change. They're not wrong to say it, even if it lands awkwardly. You can hear it as love, even when it lands as a roadblock.</p>
<p>You're doing this for yourself. Not against anyone.</p>
<p><strong>The structure is yours. Your household doesn't have to follow it. It just has to make room for it.</strong></p>
{sig()}
{ps("If someone in your household is curious and wants to understand what you're doing, that's different — bring them to the next check-in. A fifteen-minute conversation with the team is worth more than a month of kitchen tension.")}"""
    },
    # --- EMAIL 23 ---
    {
        "name": "CS Email 23 - Your sleep is making your weight loss harder",
        "body": f"""
<p>I need to talk to you about something that has nothing to do with food.</p>
<p>Your sleep.</p>
<p>Research shows that poor sleep increases your hunger hormone (ghrelin) by about 28% and decreases your satiety hormone (leptin) by about 18%. In plain language: one bad night makes you hungrier and less able to feel full.</p>
<p>It gets worse. Studies found that after a night of poor sleep, people consume roughly 385 extra calories the next day. Not because they're weak. Because their hormones are screaming for energy.</p>
<p>And here's the finding that really changed how I think about this: in a controlled study, people sleeping 5.5 hours versus 8.5 hours — on the exact same diet — lost 55% more muscle and 55% less fat on short sleep. Same food. Same method. Completely different results based on sleep alone.</p>
<p>Your body literally decides what kind of weight to lose based on how well you slept.</p>
<p>Three things that help:</p>
<p>Finish dinner at least three hours before bed. Late eating disrupts sleep quality.<br>Limit screens in the hour before sleep. The light tricks your brain into thinking it's still daytime.<br>Cool, dark room. Your body needs temperature drop to stay in deep sleep.</p>
<p>You've built the structure. You've got the protein right. Now give your body the one thing it needs to actually use all that work.</p>
<p><strong>Sleep isn't a luxury. It's where your results are made.</strong></p>
{sig()}
{ps("If you're doing everything right and the scale still isn't moving, check your sleep before changing anything else. It's almost always part of the answer.")}"""
    },
    # --- EMAIL 24 ---
    {
        "name": "CS Email 24 - The old you would have quit by now",
        "body": f"""
<p>This is the email I've been waiting to write since the day you started.</p>
<p>Twelve weeks.</p>
<p>Let me tell you what usually happens at twelve weeks. In most programs, this is the end. The challenge is over. The motivation is gone. The structure disappears. People drift back to old patterns. Within six months, most of them are back where they started — sometimes heavier, always more discouraged.</p>
<p>You're still here.</p>
<p>Look at what you've actually done.</p>
<p>You rewired your mornings. What felt impossible in the early weeks now feels automatic.</p>
<p>You survived social pressure. Family dinners. Festa buffets. Well-meaning relatives who wanted you to eat more. You handled all of it without abandoning your structure.</p>
<p>You hit plateaus and didn't quit. You had weeks where the scale didn't move, and instead of throwing it all away, you kept going.</p>
<p>You had slip-ups and came back. Not on Monday. Not next month. At the next meal. That's a skill most people never develop. You did.</p>
<p>You learned how your body actually works. Protein for satiety. Timing for rhythm. Structure over willpower. Sleep for recovery. You understand things about your own body that most people never learn.</p>
<p>Whether you're at this milestone right now or reading this a little earlier or later in your journey — the point is the same. You kept going when it would have been easier to stop.</p>
<p>That's not a small shift. That's an identity change.</p>
<p>And here's the part that matters most: the hardest part is behind you. The early weeks required you to build everything from scratch — new habits, new rhythms, new ways of thinking. From here? You're deepening what already works.</p>
<p>You're not starting anything. You're continuing.</p>
<p>I'm proud of you. Genuinely.</p>
<p><strong>You didn't just make it this far. You became someone who doesn't quit.</strong></p>
{sig()}
{ps("Save this email somewhere you can find it. On the hard days ahead — and there will be some — it can be useful to read back through what you actually did.")}"""
    },
    # --- EMAIL 25-48 continue same pattern ---
    {"name": "CS Email 25 - Same food different order different result", "body": f"""<p>You ate the right things today. The right portions. Tracked your points.</p><p>But by 3pm you were foggy, craving sugar, reaching for something. Sound familiar?</p><p>Here is something I wish more people knew: the order you eat your food changes how your body processes it.</p><p>When you eat protein and vegetables first, then your carbs last, your blood sugar spike drops by 30-40%. Same plate. Same food. Same points. Completely different metabolic response.</p><p>Think about it. A plate of chicken, salad, and rice. If you eat the rice first, your blood sugar rockets up and crashes hard an hour later. That crash is the 3pm wall.</p><p>But if you eat the chicken first, then the salad, then the rice, your body processes the glucose slowly. Steadily. No spike. No crash. No desperate hunt for biscuits at your desk.</p><p><strong>The move: At every meal, eat protein first. Vegetables second. Carbs last.</strong></p><p>Try it at lunch today. Notice how different your afternoon feels. Not because you ate less. Because you ate smarter.</p><p>This works at home. At restaurants. At your nanna's table. Nobody even notices you are doing it.</p>{sig()}{ps("This is one of those things that sounds too simple to matter. Try it for three days. You will feel the difference by day two.")}"""},
    {"name": "CS Email 26 - Your body changed your mind hasn't caught up", "body": f"""<p>Your clothes fit differently. People have noticed. The numbers have moved.</p><p>But somewhere in the back of your mind, there is a voice. It says things like: "You'll gain it all back." Or: "This isn't really you." Or: "Don't get too comfortable."</p><p>I want to name this, because almost everyone in our programme experiences it.</p><p>Your body changes faster than your identity does.</p><p>You can lose 8 kilos and still feel like the person who couldn't stick to anything. You can drop two clothing sizes and still flinch at photos. The mirror shows one thing. The internal narrative shows another.</p><p>This is not a sign that something is wrong. It is a sign that old programming is being rewritten. And rewriting takes longer than losing weight.</p><p>Every time you return to structure after a hard day, you are overwriting that voice. Every time you track your meals when you don't feel like it, you are building evidence against the old story. Slowly, quietly, it updates. Not all at once. In layers.</p><p><strong>You are not who you were when you started. The voice just hasn't caught up yet.</strong></p><p>Be patient with it. It will. It always does.</p>{sig()}{ps("If you feel like you look different but don't feel different inside, you are not broken. You are in transition. That is exactly where growth happens.")}"""},
    {"name": "CS Email 27 - How to build a lunch that holds you until 7pm", "body": f"""<p>By now you know the basics. Protein first. Vegetables are free. Carbs at the end.</p><p>But there's a difference between knowing the rules and building a plate that actually keeps you satisfied for five hours. Let me show you the formula, because it's more specific than "eat protein."</p><p>Here is how to build a lunch that holds:</p><p><strong>One palm of protein.</strong> Grilled chicken, tuna, eggs, leftover lamb from last night. Doesn't matter the source. One palm. That's the anchor.</p><p><strong>Two fists of vegetables.</strong> This is where most people undercut themselves. A few leaves of salad is not two fists. Two fists is a serious pile — half a plate. Roasted courgette and peppers. A big handful of dressed rocket. Whatever is in the fridge. Volume is the goal.</p><p><strong>One fist of carbs.</strong> Bread, rice, pasta, potato. One fist. Eaten last, after the protein and vegetables are already in.</p><p>That's the formula. One palm protein. Two fists vegetables. One fist carb.</p><p>On a Tuesday, that might look like: leftover chicken from last night, spinach with a squeeze of lemon, and two slices of Maltese bread. It takes four minutes to assemble. It costs almost nothing. And you are genuinely not hungry until dinner.</p><p><strong>One palm. Two fists. One fist. In that order.</strong></p>{sig()}{ps("If you find yourself hungry two hours after lunch, the answer is almost always more vegetables, not more carbs. Add the second fist before you add anything else.")}"""},
    {"name": "CS Email 28 - CoolSculpting what it actually does", "body": f"""<p>Some people at this stage notice something odd.</p><p>They're losing weight. The scale is moving. The clothes are fitting differently. But there's one spot — the lower belly, the flanks, the inner thighs — that seems to be ignoring everything. Everywhere else is responding. That one area has its own agenda.</p><p>This is not a failure of the method. It is how bodies redistribute fat. Some areas are far more stubborn than others. That's biology, not a personal flaw.</p><p>CoolSculpting was designed specifically for those spots.</p><p>It is not a weight loss treatment. That distinction matters. It does not help you lose kilos — what you're doing with the method does that. What CoolSculpting does is reduce fat cells in a targeted area that is already changing slowly. Controlled cooling freezes fat cells to a temperature where they die naturally. Your body clears them over 8-12 weeks. The cells are gone permanently.</p><p>Clinical studies show a 20-25% reduction in fat in the treated area. It works best once you're already losing weight, not instead of it.</p><p>It is not for everyone. Our doctor assesses suitability individually, because the right candidate matters more than the treatment itself. But if you've been wondering why one area seems resistant to everything else — this is the honest answer to that question.</p><p><strong>Your progress is real. Some spots just take a different conversation.</strong></p>{sig()}{ps("If this sounds relevant to where you are, ask at your next check-in. I'd rather you hear the full picture from us than piece it together from a search.")}"""},
    {"name": "CS Email 29 - Protein keeps you full this keeps you fed", "body": f"""<p>You are eating your protein. Good portions. Proper meals.</p><p>But an hour and a half later, you feel empty again. Like the meal just... evaporated.</p><p>If that sounds familiar, the missing piece is probably fibre.</p><p>Protein makes you feel full at the end of a meal. Fibre is what makes that fullness last. It slows digestion. It keeps food moving through your system gradually instead of all at once. It is the difference between a meal that holds you for two hours and one that holds you for five.</p><p>You need about 25-30 grams a day. Most people get about half that.</p><p>Here is the easiest way to get there:</p><p>• <strong>Two fists of vegetables at lunch and dinner.</strong> You're already building the plate this way from the plate formula.</p><p>• <strong>Now layer fibre into your carb choices.</strong> Beans, lentils, oats, skin-on potatoes, wholegrain bread. These do double duty: carb points plus fibre. Swap one refined carb for one of these this week. That's the upgrade.</p><p>• <strong>Fruit with skin on.</strong> An apple with the skin has three times more fibre than apple juice.</p><p>You don't need a supplement. You just need to choose the carbs and vegetables that bring fibre along for the ride.</p><p><strong>If protein is what stops you eating, fibre is what stops you thinking about eating.</strong></p>{sig()}{ps("Minestra — the thick Maltese lentil soup — is one of the highest-fibre, lowest-point meals you can make. If your grandmother made it, they were ahead of every nutrition trend by about forty years.")}"""},
    {"name": "CS Email 30 - I'm not going to tell you to join a gym", "body": f"""<p>I'm not going to tell you to join a gym.</p><p>I'm not going to suggest a morning run, a fitness class, or a step count. If you're doing any of those things, great. But that's not what this email is about.</p><p>This is about something smaller. And the science behind it surprised even me.</p><p>Walking for 20 minutes after dinner reduces your post-meal blood sugar spike by roughly the same amount as an extra serving of protein does. That's not exercise. That's a stroll around the block. At a pace where you can still talk. In your normal clothes.</p><p>When you eat and then sit still, your blood sugar peaks and stays elevated for longer. When you move — even gently — your muscles absorb some of that glucose directly, without insulin doing all the work. The spike flattens. The crash is smaller. The evening hunger that follows is reduced.</p><p>This is worth knowing because dinner is the most variable meal for most people in the programme. It's the one most affected by what happened during the day, by how tired you are, by what the family wants. A 20-minute walk after eating doesn't fix a hard day. But it does change what happens to that meal inside your body.</p><p>No app required. No kit. No commitment beyond the time it takes to walk to the end of your road and back.</p><p><strong>A 20-minute walk after dinner is not fitness. It's physiology. There's a difference.</strong></p>{sig()}{ps("If you have a dog, you're probably already doing this. If you don't, consider borrowing the neighbour's.")}"""},
    {"name": "CS Email 31 - How to survive a Maltese wedding buffet", "body": f"""<p>Wedding season. Communion season. Baptism season. In Malta, there is always a reason to stand in front of a massive buffet feeling conflicted.</p><p>Let me give you a strategy that works.</p><p><strong>Before the event:</strong> Eat a structured protein lunch. Not tiny. Not punishing. A proper meal with protein and vegetables. You are not "saving points" for later. You are arriving stable so you make decisions instead of reactions.</p><p><strong>At the event:</strong> Hit the buffet with a plan. Protein first. Grilled chicken, fish, cold cuts. Fill half your plate. Add vegetables or salad. Then choose one carb. Pasta or bread or potatoes. Not all three. One.</p><p><strong>Skip the bread basket.</strong> It is filler. It shows up before every course and adds nothing. Let it pass.</p><p><strong>Have the cake.</strong> It is a wedding. Someone's nanna made the qaghaq tal-ghasel and they are watching. Have a piece. Enjoy it completely. One piece of cake does not undo months of consistency.</p><p>You have been doing this long enough to know how to eat. Trust that.</p><p><strong>The goal is not perfection at events. It is returning to structure after them.</strong></p>{sig()}{ps("The people who struggle most at events are the ones who skip meals beforehand. Arrive fed. The rest is easy.")}"""},
    {"name": "CS Email 32 - Here's what comes next", "body": f"""<p>I want to mark this moment. But I want to do it differently than earlier milestones, because where you are now is different.</p><p>At the earlier milestones, the emails were about what you survived. Buffets. Plateaus. Slip-ups. Relatives with opinions. And you did survive all of it. That chapter was about proving to yourself that you could hold the structure when everything pushed against it.</p><p>That proof is done. You have it.</p><p>This moment — when you've been at this for several months — is not about survival anymore.</p><p>The first stretch was about building something. Learning the structure. Wiring the habits. Finding out how your body actually responds. That phase is complete.</p><p>What comes next is about something different: deepening what already works.</p><p>You are not learning anymore. You are refining.</p><p>You know the plate formula now. The next step is noticing which version of it works best for you — Tuesday lunch at home versus Thursday lunch on the run versus Friday dinner when you're tired. The method is the same. Your specific version of it gets sharper.</p><p>You know the Return Rule. The next step is returning faster. Not because you will slip less — maybe you will — but because you will notice the drift earlier and come back with less drama.</p><p>The question in the first phase was: can I do this?</p><p>The question now is: what does my best version of this look like?</p><p>That is a more interesting question. And you are ready for it.</p><p><strong>The foundation is built. Now you get to make it yours.</strong></p>{sig()}{ps("You kept going. That's the whole story. Be proud of it.")}"""},
    {"name": "CS Email 33 - Why stress makes you gain weight", "body": f"""<p>If you have ever noticed that you stall or gain weight during stressful periods, it is not in your head. There is a direct biological mechanism behind it.</p><p>When you are chronically stressed, your body produces more cortisol. Cortisol does three things that work against you:</p><p>1. <strong>Increases appetite.</strong> Especially for high-calorie, high-carb foods.</p><p>2. <strong>Promotes fat storage.</strong> Specifically in your abdomen. Visceral fat tissue contains an enzyme that keeps converting inactive cortisone back into active cortisol — so the more belly fat, the more cortisol, the more belly fat. A loop the body struggles to break on its own.</p><p>3. <strong>Disrupts sleep.</strong> And poor sleep raises cortisol further. Cycle repeats.</p><p>Research shows that people with higher cortisol levels store significantly more abdominal fat, regardless of overall body weight.</p><p>The fix is not "be less stressed." That is useless advice.</p><p>Here is what actually helps during a crisis week:</p><p><strong>Tighten your meal timing, not your food.</strong> Eating at your usual times, even imperfectly, keeps the hormonal environment steadier than skipping meals to compensate.</p><p><strong>Anchor your morning.</strong> Sparkling water, coffee, nothing more. That structure costs you nothing and stabilises everything that follows.</p><p><strong>Protect your sleep window, even roughly.</strong> Going to bed within an hour of your usual time is often the one lever that actually moves the needle on cortisol during a hard week.</p><p><strong>When life gets chaotic, the structure is not just discipline. It is medicine.</strong></p>{sig()}{ps("If you stall during stressful weeks, do not cut calories. Tighten your meal timing instead. That is almost always the real lever.")}"""},
    {"name": "CS Email 34 - You've lost enough how to handle that", "body": f"""<p>It usually comes from someone close to you.</p><p>A parent. A sibling. A colleague at lunch. A friend at coffee. They look at you and say: "You've lost enough, haven't you?" Or: "Don't lose too much." Or: "You looked fine before."</p><p>In Malta, where everyone's body is somehow everyone's business, this happens constantly.</p><p>Let me tell you what is actually happening.</p><p>Sometimes it is genuine concern. They care about you and want to make sure you are okay. That is fair.</p><p>But sometimes it is discomfort. Your change forces them to confront their own choices. When you visibly transform, it can feel threatening to people who have not. That is their process, not yours.</p><p>You do not need to explain your goals. You do not need to justify your method. You do not need to defend your choices.</p><p>Here is the only response you need: <strong>"I feel great, thanks."</strong></p><p>That is complete. It is warm. It closes the conversation without conflict. It does not invite debate.</p><p><strong>Your body is not a group project. You get to decide what "enough" looks like.</strong></p>{sig()}{ps('The people who truly support you will adjust. Give them time. And for the ones who do not, "I feel great, thanks" still works perfectly.')}"""},
    {"name": "CS Email 35 - You've mastered carbs here's the next layer", "body": f"""<p>You know carbs are fine. You've been eating them throughout this programme. That conversation is behind you.</p><p>What you're ready for now is something more useful: understanding which carbs serve your body best in the long run, and why that distinction matters for maintenance.</p><p>Not because some carbs are "bad." They're not. But because at this stage, you're not just trying to lose weight — you're building an eating pattern you'll keep for years. And understanding glycaemic index as a tool (not a rule) gives you more control, not less freedom.</p><p>Here's what it actually means.</p><p>Glycaemic index measures how quickly a carbohydrate raises your blood sugar. High-GI carbs (white bread, instant rice, some breakfast cereals) raise it fast and drop it fast. The drop is what drives hunger two hours later and the urge to reach for something again. Low-to-medium GI carbs (pasta cooked al dente, basmati rice, sweet potato, sourdough, legumes) raise blood sugar more gradually. More sustained energy. Hunger that fades naturally rather than crashing.</p><p>This is not a reason to avoid high-GI foods. It's a reason to understand them. A ftira at lunch works differently in your body than white toast at breakfast. Pasta al dente behaves differently than overcooked pasta. These are not tricks or restrictions — they're just biology.</p><p><strong>The goal was never to follow rules. It was to understand your body well enough that the rules become irrelevant.</strong></p>{sig()}{ps("If you find yourself mentally flinching at carbs in certain situations — pasta at a restaurant, rice at a friend's — notice that. The flinch is old programming. The food is just food.")}"""},
    {"name": "CS Email 36 - Loose skin after weight loss what helps", "body": f"""<p>I want to talk about something that does not get discussed enough.</p><p>You have lost weight. You are proud of it. You should be. But when you look in the mirror, the skin does not quite match how you feel. It is looser than you expected. Maybe around your stomach. Maybe your arms or thighs.</p><p>This is completely normal. And before we talk about any treatment, let me tell you what you can do from the inside first.</p><p><strong>Collagen is a protein your body makes from the food you eat.</strong> The building blocks are vitamin C (found in peppers, citrus, broccoli), protein itself (you're already doing this), and zinc (tinned fish, eggs, pumpkin seeds). Consciously including more vitamin C-rich vegetables alongside your protein gives your skin's repair systems the raw materials they need.</p><p><strong>Hydration matters more than most people realise for skin elasticity.</strong> Two litres of water daily — this directly affects how quickly skin can remodel as the body changes.</p><p><strong>Slow, consistent loss gives skin more time to adapt.</strong> The gradual pace of this method is actually kinder to your skin than rapid loss programs.</p><p>When nutrition and time are not enough, that is where treatment becomes genuinely useful. VelaShape III combines radiofrequency energy, infrared light, and vacuum-assisted massage to stimulate collagen production and improve skin tone. Over four sessions, it triggers your skin's natural tightening response. No surgery. No downtime.</p><p><strong>You worked hard to change your body. It is okay to want your skin to keep up.</strong></p>{sig()}{ps("Loose skin is one of the things people feel most self-conscious about but least willing to mention. If that is you, you are not alone — and there are both nutritional steps and clinical options worth knowing about.")}"""},
    {"name": "CS Email 37 - Coming home from holiday", "body": f"""<p>You already know how to eat on holiday.</p><p>Protein first. Light mornings. Enjoy the local food, don't stress the week. You've been practising this method for a while now — you'll apply it abroad without thinking too hard. That part is fine.</p><p>Here's what nobody tells you: the scale when you get home.</p><p>It will probably show a number two kilos higher than when you left. Maybe more.</p><p>I want you to know exactly why, before you see it, so you don't spiral.</p><p><strong>That is not fat. That is water.</strong></p><p>When you eat more carbohydrates than usual — and you will, on holiday, because that's the point of being on holiday — your body stores glycogen in your muscles. Every gram of glycogen is stored with approximately three grams of water. A week of relaxed eating means full glycogen stores. Full glycogen stores look like 1.5-2.5 kilos on the scale.</p><p>It is also sodium. Restaurant meals, local food, eating out every day — more salt than usual. Salt holds water.</p><p>None of this is fat gain. Fat gain takes a sustained calorie surplus over weeks. One holiday does not do that.</p><p>The realistic timeline: within three to five days of returning to your normal structure, the water leaves. The number drops.</p><p><strong>A week of living your life is not a setback. It is proof that there is no such thing as starting over — only returning.</strong></p>{sig()}{ps("If you see a number that startles you when you step on after holiday, wait four days before drawing any conclusions. You'll feel differently about it by then.")}"""},
    {"name": "CS Email 38 - The gut-brain connection explains your cravings", "body": f"""<p>Have you noticed something strange lately?</p><p>The chocolate doesn't call the way it used to. The bread basket at dinner feels optional. The 4pm sugar pull has gone quiet.</p><p>That's not willpower. That's your gut changing.</p><p>Your intestines contain trillions of bacteria that communicate directly with your brain through what scientists call the gut-brain axis. These bacteria influence what you crave, how hungry you feel, and even your mood.</p><p>Here's what's fascinating: when researchers transplanted gut bacteria from overweight mice into lean mice, the lean mice gained weight. Same food. Different bacteria. Different outcome.</p><p>But the reverse is also true. When you eat more vegetables, more fibre, more whole food, you feed the bacteria that reduce sugar cravings. And your gut microbiome starts shifting within days of changing your diet.</p><p>You've been eating differently for months now. Your gut bacteria have been quietly reorganising. The cravings that used to feel like willpower battles? Your biology is handling them for you now.</p><p><strong>Your cravings getting quieter isn't discipline. It's your body catching up to your decisions.</strong></p>{sig()}{ps("This is one of the most beautiful things about sustained change. Your body starts wanting what's good for it.")}"""},
    {"name": "CS Email 39 - Bored of your rotation", "body": f"""<p>You solved the meal prep problem somewhere in the early weeks.</p><p>You found your rotation — two or three proteins you trust, the vegetables that work, the one carb per meal. You stopped overthinking it. It became automatic. And that's exactly what was supposed to happen.</p><p>But something else has probably happened too: you're bored.</p><p>Not failing. Not struggling. Just quietly, mildly bored of eating the same five things in slightly different combinations. And somewhere in that boredom, a small voice is wondering if wanting more variety is a weakness or a warning sign.</p><p>It is neither. It is a natural part of the process.</p><p>Here's how to expand without breaking what works.</p><p><strong>Change one thing at a time.</strong> If chicken breast has been your Tuesday lunch for months, try switching the protein to something you've never cooked in this context. Halloumi. Lemon-baked salmon. Lamb kofta. Keep everything else the same.</p><p><strong>Use herbs and spices freely.</strong> They have no points and they transform the same ingredients into entirely different meals. Za'atar on eggs. Cumin on roasted vegetables. Fresh mint through a salad you've been eating plain.</p><p><strong>Try one new protein per week, not one new meal.</strong> Canned sardines on a ftira instead of tuna. Smoked mackerel instead of chicken. Keep everything else familiar.</p><p><strong>Variety is not the enemy of structure. Done right, it's what makes structure sustainable long-term.</strong></p>{sig()}{ps("If you're rotating the same five meals and genuinely not bored, do not fix what isn't broken. Boredom is the only signal that warrants a change.")}"""},
    {"name": "CS Email 40 - Let me tell you what I see", "body": f"""<p>I want to pause for a moment and tell you something.</p><p>You've been at this for months. Most weight loss programs don't last this long. Most companies design 8-week programs because they know people quit before 12. You didn't quit at 8. You didn't quit at 12. You're still here, and I want to tell you what I see from this side.</p><p>I see someone who had that Tuesday where everything went wrong — the wrong food, the wrong thoughts, the familiar spiral pulling at you like it always used to. And you still came back. Not on Monday. That same evening. Or the next morning at the latest. You came back. You always came back.</p><p>That's not the method. That's you.</p><p>I see someone who stopped weighing in with dread and started checking the weekly trend with curiosity. Who stopped saying "I can't eat that" and started saying "I don't need that right now." Who sat through a family dinner and made their choices quietly, without announcing them, without apologising for them.</p><p>I see someone who has been tested by holidays, festas, work stress, hormonal shifts, family opinions, and their own inner critic. And they're still here.</p><p>That's not a diet. That's not motivation. That's not even discipline.</p><p>That's identity.</p><p>The method isn't something you follow anymore. It's something you are.</p><p><strong>You didn't just change your habits. You changed yourself. I see it, even if you're still catching up.</strong></p>{sig()}{ps("I'm proud of you. That's not something I say lightly, and it's not something I say to everyone. But I mean it.")}"""},
    {"name": "CS Email 41 - Maintenance isn't a phase", "body": f"""<p>The word "maintenance" probably makes your stomach tighten.</p><p>Every diet you've ever done had a maintenance phase. And that's where it fell apart. You lost the weight, you "graduated," the structure disappeared, and the weight came back.</p><p>I want to tell you something that might surprise you.</p><p>There is no maintenance phase in this method.</p><p>What you're doing right now, this week, is maintenance. The timing. The protein-first approach. The return rule. The way you handle weekends and social meals. All of it.</p><p>When your initial programme wraps up, here is exactly what changes: your daily points allocation is adjusted upward. In practice, that usually means an additional portion of carbohydrate at one meal, or a slightly larger dinner, or a dessert on a Saturday without it affecting anything. The adjustment is calculated specifically for you.</p><p>What does not change: the morning structure. Protein first. The return rule. The timing. Your check-in with the clinic does not disappear either — you remain in the system, and if something shifts, you come back and we recalibrate.</p><p>You don't need to learn anything new. You just keep doing exactly what you've been doing — with a little more breathing room.</p><p><strong>Maintenance isn't the next chapter. It's the chapter you're already in.</strong></p>{sig()}{ps("The anxiety you feel about &#39;after&#39; is perfectly normal. But &#39;after&#39; looks exactly like right now. That&#39;s the whole point.")}"""},
    {"name": "CS Email 42 - The identity shift nobody warned you about", "body": f"""<p>I want to ask you something.</p><p>When did it happen?</p><p>When did you stop being "someone trying to lose weight" and become "someone who eats this way"?</p><p>Maybe it was at a restaurant, when you ordered the grilled fish and salad without thinking about it. Not because you were being "good." Because that's what you wanted.</p><p>Maybe it was a Monday morning when you returned to structure after a big weekend, and it felt automatic. No guilt. No drama. Just the next meal.</p><p>Maybe it was when someone offered you a second helping and you said "I'm good, thanks" and meant it. Not because you were depriving yourself. Because you were full.</p><p>You probably can't pinpoint the exact moment. That's because identity shifts don't announce themselves. They happen quietly, in the space between decisions, until one day you realise: this is just who I am now.</p><p>This is the most important thing that has happened since you started. Not the weight you lost. Not the clothes that fit differently.</p><p>The identity shift.</p><p>Because habits can be broken. Motivation fades. Willpower runs out.</p><p>But identity? Identity is the hardest thing to undo.</p><p><strong>You didn't just build new habits. You became a different person. And that person isn't going anywhere.</strong></p>{sig()}{ps('If this email made you pause and think "yeah... that is who I am now," then you already know everything you need to know about what comes next.')}"""},
    {"name": "CS Email 43 - People are noticing", "body": f"""<p>By now, people have been commenting on your body for weeks.</p><p>Some of it feels good. Genuinely, warmly good. A colleague who says "you look incredible" and means it. A friend who says "I can see how hard you've worked." Those comments land in the right place. You receive them and feel seen.</p><p>And then there are the other ones.</p><p>The ones that feel intrusive. A family member who has started monitoring your plate at dinner. A coworker who keeps bringing up your weight in meetings. A casual acquaintance who says "don't lose too much" in a tone that isn't concern — it's something closer to warning.</p><p>Some comments feel possessive. Some feel competitive. Some come from people who clearly have their own relationship with food and are working something out through your transformation.</p><p>All of it is information about them. None of it is your responsibility to manage.</p><p>You do not owe anyone a detailed explanation of your method, your goals, or how much further you want to go. "I feel great, thank you" is a complete sentence. So is a warm smile and a subject change.</p><p>For comments that feel invasive rather than celebratory, you are allowed to say — calmly, without apology — "I'd rather not discuss my weight, but I appreciate you noticing." That's not rude. That's a boundary.</p><p><strong>Your transformation belongs to you. What other people make of it is their business, not yours to manage.</strong></p>{sig()}{ps("And if someone asks about your programme — you'll know what to say. Not because you were coached on it, but because it's your truth now.")}"""},
    {"name": "CS Email 44 - What hormones and weight loss have in common", "body": f"""<p>If you've felt like your body is playing by different rules lately, you're not imagining it.</p><p>Hormonal changes — whether from perimenopause, andropause, thyroid shifts, PCOS, or other conditions — genuinely affect how your body stores fat, how hungry you feel, and how fast you lose weight.</p><p>Here's what happens. Hormonal shifts can redirect fat storage to your abdomen. Reduced insulin sensitivity means your body partitions more calories toward fat. Sleep disruption triggers the hunger hormones that make everything harder.</p><p>The largest metabolism study ever conducted — over 6,400 people — found that metabolism stays remarkably stable between ages 20 and 60. So it's not that your metabolism "broke." The hormonal environment changed.</p><p>Before your next check-in, here are three things worth noticing:</p><p><strong>Are you stalling despite tight timing and consistent protein?</strong> A multi-week plateau that doesn't respond to the usual levers is worth investigating hormonally.</p><p><strong>Has your sleep changed significantly?</strong> Not just one bad week — a sustained shift in sleep quality.</p><p><strong>Are you experiencing other symptoms alongside the stall?</strong> Mood shifts, changes in energy levels, persistent fatigue. Any of these alongside a stall is worth a specific conversation with the doctor.</p><p>The method already accounts for hormonal variation. The clinic adjusts your plan based on what your body is doing, not just what the scale says.</p><p><strong>You're not weak. Your hormones are real. And the clinic adjusts for them.</strong></p>{sig()}{ps("If you feel like this describes you, bring the specific observations — the timing of the stall, the sleep changes, any other symptoms. The more precise you are, the more precisely the doctor can respond.")}"""},
    {"name": "CS Email 45 - Some areas changed one or two didn't", "body": f"""<p>You've probably noticed it by now.</p><p>Some parts of your body changed dramatically. The overall shape. The way your clothes fit. The energy and the ease. Those parts responded exactly as they were supposed to.</p><p>And then there are one or two areas that didn't quite follow. Despite everything. A patch of belly that stubbornly stayed. Inner thighs that moved less than everything else. A bit of loose skin that the mirror registers even if no one else does.</p><p>That is not failure. That is fat cell geography.</p><p>Some fat deposits are biologically resistant — not because the method didn't work, but because certain areas have a higher density of fat cells that respond last to changes in overall energy balance. Hormones, genetics, and the rate of loss all influence which areas hold on longest. None of it is within your control.</p><p>If there is a specific area that bothers you, name it at your next appointment. Not "I want to look better generally" — but "this specific area hasn't moved and it's the one I notice most." That precision lets the doctor match you to what actually addresses your situation.</p><p>No pressure and no timeline. Some members explore this during the programme. Some come back months later. Some never need it. All three outcomes are fine.</p><p><strong>The programme changed what it could change. What's left — if anything — is refinement, not repair.</strong></p>{sig()}{ps("If you're genuinely unsure whether what you're seeing is normal or worth discussing, just ask at your next check-in. You don't need to have a formed opinion about treatment before raising it.")}"""},
    {"name": "CS Email 46 - A letter to the version of you who was scared", "body": f"""<p>I want you to think about that version of yourself for a moment.</p><p>The person who sat in front of their phone when you first started, reading about yet another program, already half-convinced it wouldn't work. Because nothing had worked before.</p><p>You'd tried the calorie counting. The meal replacements. The gym memberships that lasted six weeks. The Monday restarts that collapsed by Wednesday. You were tired. Not just physically tired. Tired of hoping.</p><p>You signed up anyway. Not because you were confident. Because you had one more try left in you.</p><p>And then you did something remarkable.</p><p>You didn't do it perfectly. You had bad weekends. You ate the pastizzi. You skipped structure on holiday. You had weeks where the scale didn't move and weeks where your motivation disappeared entirely.</p><p>But you kept returning.</p><p>After the bad weekends, you returned. After the plateaus, you returned. After the family dinners and the all-or-nothing thoughts and the voice that said "what's the point," you returned.</p><p>That was the skill. Not perfection. Not discipline. Not willpower.</p><p>Returning.</p><p>And you got so good at returning that it stopped being effort and became identity. You stopped fighting your life and started building a structure that fit inside it.</p><p><strong>If you could go back and tell that earlier version of yourself one thing, tell them this: "You're going to be okay. Better than okay. You're going to surprise yourself."</strong></p>{sig()}{ps("That earlier you would be so proud. I hope you know that.")}"""},
    {"name": "CS Email 47 - You don't need me to tell you these anymore", "body": f"""<p>Whether you've been doing this for six weeks or six months, something has become clear: you already know what works. You have known for a while. You probably do not need a list — you live the list. It just feels like you.</p><p>So I'm not going to tell you what to do. I'm going to show you what you've already built.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p><strong>1. Morning: sparkling water, coffee, tea. No food until lunch.</strong><br>At some point you stopped thinking about this. Now it just is. The morning is yours.</p><p><strong>2. Protein first at every main meal.</strong><br>You probably notice when you accidentally do it the other way around now. Not guilt — just a quiet internal register. The body knows.</p><p><strong>3. Vegetables for free volume.</strong><br>You've eaten more vegetables since starting than in the years before combined. Because they became the scaffolding that made every meal work.</p><p><strong>4. Save your points for the evening.</strong><br>Light morning, structured lunch, flexible dinner. You found the version of this that fits your life specifically.</p><p><strong>5. After any slip-up, return at the next meal.</strong><br>This is the one. The one that made everything else possible. You will use this for the rest of your life.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"><p>These are not the five things you need to remember. They are the five things you have already learned.</p><p><strong>These five defaults are worth coming back to at any stage. Not because you forgot them — because seeing how deeply you've internalised them is its own kind of proof.</strong></p>{sig()}{ps("If you remember nothing else, remember number five. Returning is the skill that changed everything.")}"""},
    {"name": "CS Email 48 - This isn't goodbye this is the next stretch", "body": f"""<p>I want to be honest about something: the method doesn't have a finish line. And neither do these emails.</p><p>You started something you weren't sure would work. You'd been burned before. You'd been promised things by programs that couldn't deliver them. You had every reason to be sceptical, and you signed up anyway.</p><p>And then, week by week, something shifted.</p><p>First it was the mornings. Sparkling water where toast used to be. A different kind of hunger by noon — steadier, more patient. You hadn't expected that.</p><p>Then it was the resilience. That Saturday that would have written off the whole week in the old version of your life. You returned on Saturday evening. Or Sunday morning. You returned, and nothing unravelled.</p><p>Then it was something deeper and harder to name. The way you sat at a table and made your choices without announcing them. The way the scale became information rather than verdict. The way you stopped negotiating with yourself and started simply living.</p><p>You didn't just follow a plan. You built a new version of yourself. And that version keeps growing.</p><p>There's always more to learn — new science to share, new strategies for the seasons and stages of your life, new ways the method adapts as your body and circumstances change. These emails will keep arriving with fresh insights, because the journey doesn't stop just because the foundation is solid.</p><p>The clinic is here whenever you need it. For adjustments, for body treatments, for a check-in, or just for someone who understands. The door is always open.</p><p>And if there's ever a hard week, a bad month, a moment where the old voice creeps back, remember: you know how to return. You've always known. That was the skill that made everything else possible.</p><p>Keep going. There is more ahead — and you're ready for it.</p><p><strong>This isn't the end of anything. It's the part where you stop wondering if it will stick and start living like it already has.</strong></p>{sig()}{ps("Thank you for trusting us with your journey. The next email is already on its way.")}"""},
]

def create_template(email):
    """Create a single template in Klaviyo."""
    html = wrap_html(email["body"])
    payload = {
        "data": {
            "type": "template",
            "attributes": {
                "name": email["name"],
                "editor_type": "CODE",
                "html": html
            }
        }
    }
    response = requests.post(BASE_URL, headers=HEADERS, json=payload)
    return response

def main():
    print(f"Creating {len(EMAILS)} email templates in Klaviyo...")
    print(f"API Key: {API_KEY[:8]}...{API_KEY[-4:]}")
    print()

    success = 0
    failed = 0

    for i, email in enumerate(EMAILS):
        print(f"[{i+1:02d}/48] {email['name']}...", end=" ", flush=True)
        try:
            resp = create_template(email)
            if resp.status_code in (200, 201):
                data = resp.json()
                template_id = data.get("data", {}).get("id", "unknown")
                print(f"OK (ID: {template_id})")
                success += 1
            else:
                print(f"FAILED ({resp.status_code}): {resp.text[:200]}")
                failed += 1
        except Exception as e:
            print(f"ERROR: {e}")
            failed += 1

        # Rate limit: 1 req/sec burst
        time.sleep(1.1)

    print()
    print(f"Done! {success} created, {failed} failed.")

if __name__ == "__main__":
    main()
