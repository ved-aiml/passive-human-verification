import random
import csv

data = []

def noise(val, pct=0.2):
    return val * (1 + random.uniform(-pct, pct))


def generate_human():
    session = random.uniform(20, 100)
    actions = random.randint(80, 400)

    return {
        "avg_mouse_speed": noise(random.uniform(200, 1000)),
        "mouse_speed_variance": noise(random.uniform(10000, 300000)),

        "click_interval_avg": noise(random.uniform(0.5, 2.5)),
        "click_interval_variance": noise(random.uniform(0.5, 3.0)),

        "typing_avg_delay": noise(random.uniform(0.2, 1.0)),
        "typing_variance": noise(random.uniform(0.3, 1.2)),
        "backspace_count": random.randint(0, 12),

        "scroll_speed": noise(random.uniform(100, 1500)),
        "hesitation_time": noise(random.uniform(1, 8)),

        "session_duration": session,
        "actions_per_second": actions / session,

        "idle_ratio": noise(random.uniform(0.2, 0.7)),
        "curvature_score": noise(random.uniform(0.4, 2.0)),

        "label": 1
    }


def generate_bot():
    session = random.uniform(5, 40)
    actions = random.randint(150, 600)

    return {
        "avg_mouse_speed": noise(random.uniform(400, 1800)),
        "mouse_speed_variance": noise(random.uniform(5000, 150000)),

        "click_interval_avg": noise(random.uniform(0.05, 1.0)),
        "click_interval_variance": noise(random.uniform(0.01, 1.5)),

        "typing_avg_delay": noise(random.uniform(0.02, 0.4)),
        "typing_variance": noise(random.uniform(0.05, 0.6)),
        "backspace_count": random.randint(0, 4),

        "scroll_speed": noise(random.uniform(300, 3000)),
        "hesitation_time": noise(random.uniform(0.0, 3.0)),

        "session_duration": session,
        "actions_per_second": actions / session,

        "idle_ratio": noise(random.uniform(0.0, 0.3)),
        "curvature_score": noise(random.uniform(0.1, 0.8)),
        "label": 0
    }
def generate_ambiguous():
    session = random.uniform(10, 60)
    actions = random.randint(100, 400)

    return {
        "avg_mouse_speed": random.uniform(300, 1200),
        "mouse_speed_variance": random.uniform(5000, 200000),

        "click_interval_avg": random.uniform(0.2, 2.0),
        "click_interval_variance": random.uniform(0.2, 2.0),

        "typing_avg_delay": random.uniform(0.1, 0.8),
        "typing_variance": random.uniform(0.1, 0.8),

        "backspace_count": random.randint(0, 5),

        "scroll_speed": random.uniform(200, 2000),
        "hesitation_time": random.uniform(0.5, 5.0),

        "session_duration": session,
        "actions_per_second": actions / session,

        "idle_ratio": random.uniform(0.1, 0.5),
        "curvature_score": random.uniform(0.2, 1.2),
        "label": random.choice([0, 1])
    }


for _ in range(5000):
    data.append(generate_human())

for _ in range(5000):
    data.append(generate_bot())

for _ in range(2000):
    data.append(generate_ambiguous())


keys = data[0].keys()

with open("dataset.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=keys)
    writer.writeheader()
    writer.writerows(data)