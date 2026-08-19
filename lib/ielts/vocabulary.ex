defmodule Ielts.Vocabulary do
  @moduledoc """
  CEFR vocabulary content for the flashcard feature.
  """

  @level_order ["A2", "B1", "B2", "C1", "C2"]

  def level_order, do: @level_order

  def levels do
    Map.new(@level_order, fn level -> {level, words_for(level)} end)
  end

  defp words_for("A2") do
    [
      item(
        "A2",
        "Travel",
        "V.",
        "tra.v",
        "To go from one place to another, usually for pleasure or work.",
        "الانتقال من مكان إلى آخر عادةً من أجل المتعة أو العمل.",
        "I love to travel to new countries every year."
      ),
      item(
        "A2",
        "Problem",
        "N.",
        "pro.b",
        "A situation that causes difficulty and needs to be solved.",
        "مشكلة أو موقف يسبب صعوبة ويحتاج إلى حل.",
        "We need to solve this problem."
      ),
      item(
        "A2",
        "Message",
        "N.",
        "mes.s",
        "A piece of information that is sent or given to someone.",
        "رسالة أو معلومة يتم إرسالها إلى شخص آخر.",
        "She sent me a message this morning."
      ),
      item(
        "A2",
        "Enjoy",
        "V.",
        "en.j",
        "To get pleasure from something.",
        "الاستمتاع بشيء والشعور بالسعادة عند القيام به.",
        "I enjoy reading in my free time."
      ),
      item(
        "A2",
        "Answer",
        "N.",
        "ans.w",
        "Something you say or write in response to a question.",
        "إجابة أو رد على سؤال.",
        "Do you know the answer to this question?"
      ),
      item(
        "A2",
        "Decide",
        "V.",
        "dec.i",
        "To choose something after thinking about the possibilities.",
        "اتخاذ قرار بعد التفكير في الخيارات المختلفة.",
        "We need to decide where to go."
      ),
      item(
        "A2",
        "Friendly",
        "ADJ.",
        "fri.e",
        "Kind, pleasant, and easy to talk to.",
        "ودود ولطيف وسهل التحدث معه.",
        "Everyone at the hotel was very friendly."
      ),
      item(
        "A2",
        "Hurry",
        "V.",
        "hur.r",
        "To move or do something quickly because there is little time.",
        "الإسراع في الحركة أو القيام بشيء بسبب ضيق الوقت.",
        "Hurry, or we will miss the bus."
      ),
      item(
        "A2",
        "Listen",
        "V.",
        "lis.t",
        "To pay attention to someone or something in order to hear it.",
        "الاستماع والانتباه إلى شخص أو صوت.",
        "Please listen carefully to the teacher."
      ),
      item(
        "A2",
        "Simple",
        "ADJ.",
        "sim.p",
        "Easy to understand or do; not complicated.",
        "بسيط وسهل الفهم أو التنفيذ وغير معقد.",
        "The instructions are very simple."
      )
    ]
  end

  defp words_for("B1") do
    [
      item(
        "B1",
        "Achieve",
        "V.",
        "ach.i",
        "To succeed in doing something that you wanted or planned to do.",
        "تحقيق شيء كنت تخطط أو تسعى للوصول إليه.",
        "She worked hard to achieve her goal."
      ),
      item(
        "B1",
        "Advice",
        "N.",
        "ad.v",
        "An opinion or suggestion about what someone should do.",
        "نصيحة أو اقتراح حول ما ينبغي على شخص القيام به.",
        "My teacher gave me useful advice."
      ),
      item(
        "B1",
        "Experience",
        "N.",
        "exp.e",
        "Knowledge or skill gained from doing or seeing something.",
        "معرفة أو مهارة يتم اكتسابها من خلال القيام بشيء أو تجربته.",
        "Working abroad was a valuable experience."
      ),
      item(
        "B1",
        "Improve",
        "V.",
        "im.p",
        "To become better or make something better.",
        "أن يصبح الشيء أفضل أو أن تقوم بتحسينه.",
        "Reading every day can improve your vocabulary."
      ),
      item(
        "B1",
        "Opportunity",
        "N.",
        "opp.o",
        "A situation that makes it possible to do something useful or desirable.",
        "فرصة أو ظرف يتيح لك القيام بشيء مفيد أو مرغوب فيه.",
        "This job is a great opportunity to learn."
      ),
      item(
        "B1",
        "Prepare",
        "V.",
        "pre.p",
        "To get ready for something that will happen in the future.",
        "الاستعداد لشيء سيحدث في المستقبل.",
        "I need to prepare for tomorrow's exam."
      ),
      item(
        "B1",
        "Recommend",
        "V.",
        "rec.o",
        "To suggest that someone should choose or do something.",
        "اقتراح شيء على شخص لأنك تعتقد أنه مناسب أو جيد.",
        "I recommend visiting the museum."
      ),
      item(
        "B1",
        "Responsible",
        "ADJ.",
        "res.p",
        "Having a duty to take care of something or make decisions about it.",
        "مسؤول عن القيام بواجب أو الاهتمام بشيء معين.",
        "She is responsible for organizing the meeting."
      ),
      item(
        "B1",
        "Solution",
        "N.",
        "sol.u",
        "A way of solving a problem or dealing with a difficult situation.",
        "حل لمشكلة أو طريقة للتعامل مع موقف صعب.",
        "We finally found a solution to the problem."
      ),
      item(
        "B1",
        "Suggest",
        "V.",
        "sug.g",
        "To mention an idea or plan for someone to consider.",
        "اقتراح فكرة أو خطة ليقوم شخص آخر بالتفكير فيها.",
        "I suggest taking the train instead."
      )
    ]
  end

  defp words_for("B2") do
    [
      item(
        "B2",
        "Alternative",
        "N.",
        "alt.e",
        "One of two or more possibilities that can be chosen instead of another.",
        "خيار بديل يمكن اختياره بدلًا من خيار آخر.",
        "We need to find an alternative solution."
      ),
      item(
        "B2",
        "Approach",
        "N.",
        "app.r",
        "A particular way of dealing with a situation or problem.",
        "أسلوب أو طريقة معينة للتعامل مع موقف أو مشكلة.",
        "We need a different approach to the problem."
      ),
      item(
        "B2",
        "Challenge",
        "N.",
        "cha.l",
        "A difficult task or situation that tests someone's ability.",
        "مهمة أو موقف صعب يختبر قدرة الشخص.",
        "Learning a new language can be a challenge."
      ),
      item(
        "B2",
        "Contribute",
        "V.",
        "con.t",
        "To give time, money, or ideas to help achieve something.",
        "المساهمة بالوقت أو المال أو الأفكار للمساعدة في تحقيق شيء.",
        "Everyone can contribute to the project."
      ),
      item(
        "B2",
        "Establish",
        "V.",
        "est.a",
        "To create or begin something intended to continue for a long time.",
        "إنشاء أو تأسيس شيء يُتوقع أن يستمر لفترة طويلة.",
        "The company plans to establish a new office."
      ),
      item(
        "B2",
        "Evaluate",
        "V.",
        "eva.l",
        "To judge the quality, importance, or value of something.",
        "تقييم جودة أو أهمية أو قيمة شيء ما.",
        "We need to evaluate the results carefully."
      ),
      item(
        "B2",
        "Significant",
        "ADJ.",
        "sig.n",
        "Important or large enough to have a noticeable effect.",
        "مهم أو كبير بدرجة تؤدي إلى تأثير ملحوظ.",
        "The project has made significant progress."
      ),
      item(
        "B2",
        "Maintain",
        "V.",
        "mai.n",
        "To continue to keep something at the same level or condition.",
        "الحفاظ على شيء في نفس المستوى أو الحالة.",
        "It is important to maintain a healthy lifestyle."
      ),
      item(
        "B2",
        "Require",
        "V.",
        "req.u",
        "To need something or make something necessary.",
        "الحاجة إلى شيء أو جعل وجوده ضروريًا.",
        "This position will require strong communication skills."
      ),
      item(
        "B2",
        "Relevant",
        "ADJ.",
        "rel.e",
        "Closely connected with the subject or situation being discussed.",
        "مرتبط بشكل مباشر بالموضوع أو الموقف الذي تتم مناقشته.",
        "Please include only relevant information."
      )
    ]
  end

  defp words_for("C1") do
    [
      item(
        "C1",
        "Acknowledge",
        "V.",
        "ack.n",
        "To accept or admit that something exists, is true, or has happened.",
        "الاعتراف بوجود شيء أو بصحته أو بحدوثه.",
        "The report acknowledges the limitations of the study.",
        "acknowledges"
      ),
      item(
        "C1",
        "Compelling",
        "ADJ.",
        "com.p",
        "Very convincing or interesting enough to attract strong attention.",
        "مقنع جدًا أو مثير للاهتمام لدرجة تجذب الانتباه بقوة.",
        "She presented a compelling argument."
      ),
      item(
        "C1",
        "Comprehensive",
        "ADJ.",
        "com.p",
        "Including all or nearly all the important details of a subject.",
        "شامل لجميع أو معظم التفاصيل المهمة المتعلقة بموضوع ما.",
        "The report provides a comprehensive analysis."
      ),
      item(
        "C1",
        "Consequence",
        "N.",
        "con.s",
        "A result or effect of an action, decision, or situation.",
        "نتيجة أو أثر ينتج عن فعل أو قرار أو موقف.",
        "The decision could have serious consequences.",
        "consequences"
      ),
      item(
        "C1",
        "Demonstrate",
        "V.",
        "dem.o",
        "To show clearly that something exists or is true.",
        "إظهار شيء بوضوح أو إثبات أنه موجود أو صحيح.",
        "The results demonstrate the effectiveness of the method."
      ),
      item(
        "C1",
        "Enhance",
        "V.",
        "enh.a",
        "To improve the quality, value, or effectiveness of something.",
        "تحسين جودة أو قيمة أو فعالية شيء ما.",
        "The new feature will enhance the user experience."
      ),
      item(
        "C1",
        "Implication",
        "N.",
        "imp.l",
        "A possible effect or result of an action or decision.",
        "أثر أو نتيجة محتملة لفعل أو قرار معين.",
        "We need to consider the implications of this decision.",
        "implications"
      ),
      item(
        "C1",
        "Perspective",
        "N.",
        "per.s",
        "A particular way of thinking about or understanding something.",
        "وجهة نظر أو طريقة معينة لفهم أو التفكير في شيء.",
        "The discussion helped me see the issue from another perspective."
      ),
      item(
        "C1",
        "Substantial",
        "ADJ.",
        "sub.s",
        "Large or important in amount, value, or degree.",
        "كبير أو مهم من حيث الكمية أو القيمة أو الدرجة.",
        "The company made a substantial investment."
      ),
      item(
        "C1",
        "Underlying",
        "ADJ.",
        "und.e",
        "Existing beneath the surface and forming the real cause or basis of something.",
        "كامن أو أساسي ويشكّل السبب الحقيقي أو الأساس لشيء ما.",
        "We need to understand the underlying cause of the problem."
      )
    ]
  end

  defp words_for("C2") do
    [
      item(
        "C2",
        "Ambiguous",
        "ADJ.",
        "amb.i",
        "Having more than one possible meaning and therefore difficult to understand clearly.",
        "غامض أو قابل لأكثر من تفسير أو معنى.",
        "The wording of the agreement was deliberately ambiguous."
      ),
      item(
        "C2",
        "Circumvent",
        "V.",
        "cir.c",
        "To find a clever way of avoiding a difficulty, rule, or restriction.",
        "التحايل على صعوبة أو قاعدة أو قيد بطريقة ذكية.",
        "They attempted to circumvent the existing regulations."
      ),
      item(
        "C2",
        "Coherent",
        "ADJ.",
        "coh.e",
        "Logical, well organized, and easy to understand as a complete whole.",
        "مترابط ومنطقي ومنظم بطريقة تسهّل فهمه كوحدة متكاملة.",
        "She presented a coherent explanation of the issue."
      ),
      item(
        "C2",
        "Detrimental",
        "ADJ.",
        "det.r",
        "Causing harm or damage to something.",
        "ضار أو مسبب لأثر سلبي أو ضرر.",
        "Excessive stress can be detrimental to your health."
      ),
      item(
        "C2",
        "Intricate",
        "ADJ.",
        "int.r",
        "Having many complicated and carefully connected parts or details.",
        "معقد ودقيق ويتكون من العديد من الأجزاء أو التفاصيل المترابطة.",
        "The system has an intricate network of connections."
      ),
      item(
        "C2",
        "Nuance",
        "N.",
        "nua.n",
        "A very slight difference in meaning, appearance, or expression.",
        "فرق دقيق جدًا في المعنى أو التعبير أو المظهر.",
        "The translation fails to capture every nuance of the original text."
      ),
      item(
        "C2",
        "Pragmatic",
        "ADJ.",
        "pra.g",
        "Dealing with problems in a practical way rather than relying only on theories.",
        "عملي ويركز على الحلول الواقعية بدلًا من الاعتماد فقط على النظريات.",
        "We need a pragmatic solution to the issue."
      ),
      item(
        "C2",
        "Scrutinize",
        "V.",
        "scr.u",
        "To examine something very carefully in order to discover important details.",
        "فحص شيء بدقة شديدة لاكتشاف التفاصيل المهمة.",
        "The committee will scrutinize every part of the proposal."
      ),
      item(
        "C2",
        "Ubiquitous",
        "ADJ.",
        "ubi.q",
        "Seeming to be present or found everywhere.",
        "منتشر في كل مكان أو يبدو وكأنه موجود في كل مكان.",
        "Smartphones have become ubiquitous in modern society."
      ),
      item(
        "C2",
        "Viable",
        "ADJ.",
        "via.b",
        "Capable of working successfully and being effective in practice.",
        "قابل للتنفيذ والنجاح بشكل عملي وفعّال.",
        "We need to determine whether the proposal is financially viable."
      )
    ]
  end

  defp item(level, word, type, pronunciation, definition, arabic, example, bold_word \\ nil) do
    %{
      word: word,
      level: level,
      type: type,
      pronunciation: pronunciation,
      definition: definition,
      arabic: arabic,
      example: example,
      bold_word: bold_word || String.downcase(word)
    }
  end
end
