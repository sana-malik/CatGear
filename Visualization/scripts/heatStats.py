import json
from collections import defaultdict

predictions = json.loads(open('../data/predictedLocations.json').read())

oranges = defaultdict(int)
greyest = defaultdict(int)

for prediction in predictions:
	oranges[prediction["oranges"]] += 1
	greyest[prediction["greyest"]] += 1

out = open('../data/heat-data.json', 'w')
out.write("var oranges = ")
out.close()

out = open('../data/heat-data.json', 'a')
json.dump(oranges, out)

out.write("\nvar greyest = ")
json.dump(greyest, out)

orangesHome = defaultdict(int)
greyestHome = defaultdict(int)
orangesNotHome = defaultdict(int)
greyestNotHome = defaultdict(int)

for prediction in predictions:
	if prediction["time"] >= "2014-05-11T19:00:00.000Z" and prediction["time"] <= "2014-05-11T23:00:00.000Z":
		orangesNotHome[prediction["oranges"]] += 1
		greyestNotHome[prediction["greyest"]] += 1
	else:
		orangesHome[prediction["oranges"]] += 1
		greyestHome[prediction["greyest"]] += 1

out.write("\nvar orangesHome = ")
json.dump(orangesHome, out)

out.write("\nvar greyestHome = ")
json.dump(greyestHome, out)

out.write("\nvar orangesNotHome = ")
json.dump(orangesNotHome, out)

out.write("\nvar greyestNotHome = ")
json.dump(greyestNotHome, out)


togetherHomeC = 0
togetherNotHomeC = 0
apartHome = 0
apartNotHome = 0

together = defaultdict(int)
togetherHome = defaultdict(int)
togetherNotHome = defaultdict(int)

for prediction in predictions:
	if prediction["oranges"] == prediction["greyest"]:
		together[prediction["oranges"]] += 1
		if prediction["time"] >= "2014-05-11T19:00:00.000Z" and prediction["time"] <= "2014-05-11T23:00:00.000Z":
			togetherNotHome[prediction["oranges"]] += 1
			togetherNotHomeC += 1
		else:
			togetherHome[prediction["oranges"]] += 1
			togetherHomeC += 1
	else:
		if prediction["time"] >= "2014-05-11T19:00:00.000Z" and prediction["time"] <= "2014-05-11T23:00:00.000Z":
			apartNotHome += 1
		else:
			apartHome += 1

print together
print togetherHome
print togetherNotHome
print "home, together:", togetherHomeC, "// home, apart:", apartHome
print "not home, together:", togetherNotHomeC, "// not home, apart:", apartNotHome

out.close()