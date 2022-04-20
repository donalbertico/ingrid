import pandas as pd
import random

df = pd.read_excel('colorcombo.xlsx')
df = df.drop(df.columns[0],1)
df.to_csv('colorcombo.csv', index=False)


colors = df.columns.array.to_numpy()
main = random.randint(0, len(colors)-1)
print(colors[main])
combo = []

i=0
while i < 6:
    color = random.randint(0, len(colors)-1)
    if colors[color] not in combo and color != main :
        print(df.at[color, colors[main]])
        if type(df.at[color, colors[main]]) is str:
            combo.append(colors[color])
            i += 1


print(combo)
