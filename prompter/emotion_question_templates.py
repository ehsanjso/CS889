TMP_EMOTION = "{{emotion}}"

EMOTION_QUESTIONS = [
    {
        'story': {
            'sing': f"Why is this character feeling {TMP_EMOTION}?",
            'plur': f"Why are these characters feeling {TMP_EMOTION}?"},
        'reader': {
            'sing': f"How can you show why this character's feeling {TMP_EMOTION}?",
            'plur': f"How can you show why these characters are feeling {TMP_EMOTION}?"}},
    {
        'story': {
            'sing': f"How does this character act when they're feeling {TMP_EMOTION}?",
            'plur': f"How do these characters interact when they're feeling {TMP_EMOTION}?"},
        'reader': {
            'sing': f"Can you reveal, through his or her actions, that this character is feeling {TMP_EMOTION}?",
            'plur': f"Can you reveal, through how they interact, that these characters are feeling {TMP_EMOTION}?"}},
    {
        'story': {
            'sing': f"How does this character speak when they're feeling {TMP_EMOTION}?",
            'plur': f"How do these characters converse when they're feeling {TMP_EMOTION}?"},
        'reader': {
            'sing': f"Can you reveal, through his or her speech, that this character is feeling {TMP_EMOTION}?",
            'plur': f"Can you reveal, through how they converse, that these characters are feeling {TMP_EMOTION}?"}},
    {
        'story': {
            'sing': f"You mentioned this character is {TMP_EMOTION}. What's going on through his or her head?",
            'plur': "N/A"},
        'reader': {
            'sing': f"You mentioned this character is {TMP_EMOTION}. Can you reveal this through his or her thoughts?",
            'plur': "N/A"}},
    {
        'story': {
            'sing': f"You mentioned this character is {TMP_EMOTION}. How does this affect the other characters?",
            'plur': "N/A"},
        'reader': {
            'sing': f"You mentioned this character is {TMP_EMOTION}."
                    + " Can you show how this affects the other characters?",
            'plur': "N/A"}},
    {
        'story': {
            'sing': f"You mentioned this character is {TMP_EMOTION}."
                    + " How does this affect how they view their surroundings?",
            'plur': "N/A"},
        'reader': {
            'sing': "Can you reveal, through how they describe their surroundings,"
                    + f" that this character is feeling {TMP_EMOTION}?",
            'plur': "N/A"}},
]

