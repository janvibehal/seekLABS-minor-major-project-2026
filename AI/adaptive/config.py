# Score thresholds used by the adaptive policy.

LOW_SCORE_THRESHOLD = 40
FOLLOW_UP_THRESHOLD = 60
GOOD_SCORE_THRESHOLD = 75


# Maximum number of times a dimension should be revisited
# before the policy prefers another unresolved gap.
MAX_DIMENSION_REVISITS = 2


# Time thresholds in seconds.

MORE_THAN_5_MINUTES = 300
TWO_MINUTES = 120
THIRTY_SECONDS = 30
# Minimum confidence required to treat the candidate's
# current approach as confidently identified.

REFERENCE_CONFIDENCE_THRESHOLD = 0.60